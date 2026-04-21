import { query } from '../config/db.js';

export const getUserOrders = async (userId) => {
  const queryStr = `
    SELECT 
      o.*, d.tracking_url,
      (
        SELECT json_agg(json_build_object('name', p.name, 'qty', oi.qty, 'price', oi.price))
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = o.id
      ) as items
    FROM orders o
    LEFT JOIN deliveries d ON o.id = d.order_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC;
  `;
  return await query(queryStr, [userId]);
};

export const getUserAddresses = async (userId) => {
  return await query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
};

export const saveUserAddress = async (userId, addressData, normalizedPhone) => {
  const { customer_name, address_line1, area, city, pincode } = addressData;
  const name = area || city;
  
  const newAddress = await query(
    `INSERT INTO addresses (user_id, customer_name, phone, address_line1, area, city, pincode, name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userId, customer_name, normalizedPhone, address_line1, area, city, pincode, name]
  );
  return newAddress[0];
};

export const getAllOrdersAdmin = async () => {
    const queryStr = `
      SELECT 
        o.*, 
        d.tracking_url, d.partner,
        (
          SELECT json_agg(json_build_object(
            'name', p.name, 
            'qty', oi.qty, 
            'price', oi.price
          ))
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN deliveries d ON o.id = d.order_id
      ORDER BY o.created_at DESC;
    `;
    return await query(queryStr);
};

export const getPendingOrdersAdmin = async () => {
    const queryStr = `
      SELECT o.*, d.tracking_url, d.partner, d.error_message
      FROM orders o
      LEFT JOIN deliveries d ON o.id = d.order_id
      WHERE o.delivery_status = 'pending' OR o.delivery_status = 'failed'
      ORDER BY o.created_at DESC;
    `;
    return await query(queryStr);
}

export const manualBookOrder = async (orderId, partner_name, tracking_url) => {
    await query(
      `INSERT INTO deliveries (order_id, partner, delivery_task_id, status, tracking_url, updated_at)
       VALUES ($1, $2, 'MANUAL', 'shipped', $3, NOW())
       ON CONFLICT (order_id) DO UPDATE SET
       partner = $2, 
       status = 'shipped', 
       tracking_url = $3, 
       error_message = NULL, 
       updated_at = NOW()`,
      [orderId, partner_name, tracking_url || null]
    );

    await query(
      `UPDATE orders SET delivery_status = 'processing' WHERE id = $1`,
      [orderId]
    );
};
