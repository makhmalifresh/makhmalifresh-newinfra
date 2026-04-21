import { eventBus } from '../utils/eventBus.js';
import { connection } from '../config/redis.js';
import pool, { query } from '../config/db.js';
import logger from '../utils/logger.js';
import { borzoCreateOrder } from '../services/borzo.service.js';
import { normalizePhoneNumber } from '../utils/helpers.js';

// Internal function to process the actual order payload
async function processOrderJob(jobData) {
  const { orderPayload, paymentResponse, userId, jobId } = jobData;
  logger.info(`Processing raw order job ${jobId} for user ${userId}`, { paymentResponse });

  const {
    cart = [],
    address = {},
    payMethod,
    subtotal = 0,
    delivery_fee = 0,
    discount_amount = 0,
    grand_total = 0,
    platform_fee = 0,
    surge_fee = 0,
  } = orderPayload;

  const phoneNorm = normalizePhoneNumber(address.phone);
  let createdOrderId = null;

  // DB TRANSACTION
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Optional: Manually check idempotency using the jobId here if needed in the future

    const insertOrderSql = `
      INSERT INTO orders (
        user_id, customer_name, phone, address_line1, area, city, pincode,
        pay_method, subtotal, delivery_fee, discount_amount, grand_total,
        platform_fee, surge_fee, status, delivery_status, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'PAYMENT_VERIFIED','pending',NOW())
      RETURNING id;
    `;

    const orderParams = [
      userId,
      address.name || "",
      phoneNorm || "",
      address.line1 || "",
      address.area || "",
      address.city || "",
      address.pincode || "",
      payMethod || "",
      Math.round(subtotal || 0),
      Math.round(delivery_fee || 0),
      Math.round(discount_amount || 0),
      Math.round(grand_total || 0),
      Math.round(platform_fee || 0),
      Math.round(surge_fee || 0),
    ];

    const orderResult = await client.query(insertOrderSql, orderParams);
    createdOrderId = orderResult.rows[0].id;

    const insertItemSql = `
      INSERT INTO order_items (order_id, product_id, qty, price)
      VALUES ($1,$2,$3,$4)
    `;

    for (const item of cart) {
      if (!item?.id) continue;
      await client.query(insertItemSql, [
        createdOrderId,
        item.id,
        item.qty || 1,
        Math.round(item.price || 0),
      ]);
    }

    await client.query("COMMIT");
    logger.info(`Order ${createdOrderId} saved to DB successfully.`);
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error('DB error creating order', { error: err.message });
    throw err; // Trigger standard retry
  } finally {
    client.release();
  }

  // Borzo booking or manual mode handling
  try {
    const dmRows = await query("SELECT setting_value FROM store_settings WHERE setting_key = 'delivery_mode'");
    const deliveryMode = (dmRows[0]?.setting_value || "manual").toLowerCase();

    if (deliveryMode === 'borzo_only' || deliveryMode === 'automatic_cheapest') {
        logger.info(`Attempting Borzo booking for ${createdOrderId}`);
        const bk = await borzoCreateOrder(address, cart, createdOrderId);
        
        await query(
          `INSERT INTO deliveries (
             order_id, delivery_task_id, partner, status,
             tracking_url, eta, updated_at
           )
           VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
          [createdOrderId, bk.order_id, "borzo", bk.status || "created", bk.tracking_url || null, null]
        );
        await query(`UPDATE orders SET delivery_status = 'processing' WHERE id = $1`, [createdOrderId]);
        logger.info(`Borzo booking successful for ${createdOrderId}`);
    } else {
        // Manual mode
        await query(
          `INSERT INTO deliveries (order_id, partner, status, updated_at, error_message)
           VALUES ($1,$2,$3,NOW(),$4)`,
          [createdOrderId, 'manual', 'PENDING', 'Manual mode chosen']
        );
        logger.info(`Order ${createdOrderId} marked as pending (manual Mode)`);
    }

  } catch (err) {
    logger.error(`Delivery booking failed for order ${createdOrderId}`, { error: err.message });
    
    // Mark as pending manual review
    await query(
      `INSERT INTO deliveries (order_id, partner, status, updated_at, error_message)
       VALUES ($1,$2,$3,NOW(),$4)`,
      [createdOrderId, 'failed', 'PENDING', err.message]
    );
  }

  return { success: true, orderId: createdOrderId };
}

let isDraining = false;

// Instant non-blocking drain queue
async function drainQueue() {
  if (isDraining) return;
  isDraining = true;
  
  try {
    while (true) {
      // Instantly parse the Redis queue. No blocking (0s execution latency)
      // Removes Upstash Idle penalty permanently.
      const result = await connection.rpop('makhmali:orderQueue');
      
      if (!result) break; // Reached the end of the queue. Shut down and wait for the next instant Event trigger.
      
      let jobData;
      try {
        jobData = JSON.parse(result);
      } catch (parseError) {
        logger.error("Failed to parse incoming order payload.", { payload: result });
        continue;
      }

      let attempts = 0;
      let success = false;
      
      while (attempts < 5 && !success) {
        try {
          await processOrderJob(jobData);
          success = true;
        } catch (jobError) {
          attempts++;
          logger.error(`Processing attempt ${attempts} failed for job ${jobData.jobId}`, { error: jobError.message });
          
          if (attempts < 5) {
             const backoffMs = Math.pow(2, attempts) * 1000;
             logger.info(`Backing off for ${backoffMs}ms before retrying job ${jobData.jobId}`);
             await new Promise(res => setTimeout(res, backoffMs));
          } else {
             logger.error(`🚨 SERIOUS FAILURE: Order ${jobData.jobId} failed deeply. Neon DB is likely down or sleeping. 
Safely returning order package to Upstash Redis queue and pausing worker for 30s to prevent spam.`);
             
             // Safely place the item BACK on the line natively ensuring absoltue zero data loss.
             await connection.lpush('makhmali:orderQueue', JSON.stringify(jobData));
             
             // Sleep the worker globally for 30 seconds to allow the DB to wake up without spamming limits
             await new Promise(res => setTimeout(res, 30000));
          }
        }
      }
    }
  } catch (networkError) {
    logger.error('Redis Listener Network Error:', networkError);
  } finally {
    isDraining = false;
  }
}

// Hook directly into the Node process for instant microsecond wake-ups
eventBus.on('new_order', () => {
  logger.info("Local event received. Instantly waking up worker...");
  drainQueue();
});

// Run once on server boot to catch any uncompleted orders from a previous crash
logger.info("Raw Redis order worker started. Clearing local backlog.");
drainQueue();
