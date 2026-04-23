import Razorpay from 'razorpay';
import crypto from 'crypto';
import { enqueueOrder } from '../queues/order.queue.js';
import { connection } from '../config/redis.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { grandTotal, orderPayload } = req.body;
    if (typeof grandTotal !== "number" || isNaN(grandTotal) || grandTotal <= 0) {
      return res.status(400).json({ error: "Invalid grandTotal" });
    }

    const options = {
      amount: Math.round(grandTotal * 100), // paisa
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    if (!razorpayOrder) {
      throw new Error("Failed to create razorpay order");
    }

    // Cache the orderPayload in Redis for webhook fallback (expires in 24 hours)
    if (orderPayload && req.auth?.userId) {
      const payloadData = {
        orderPayload,
        userId: req.auth.userId
      };
      await connection.setex(`rzp_payload:${razorpayOrder.id}`, 86400, JSON.stringify(payloadData));
    }

    res.json({
      orderId: razorpayOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
    });
  } catch (e) {
    res.status(500).json({ error: "Error creating Razorpay order" });
  }
};

export const verifyAndSubmitPayment = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { orderPayload, paymentResponse } = req.body;

    if (!orderPayload || !paymentResponse) {
      return res.status(400).json({ error: "orderPayload and paymentResponse required" });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
    shasum.update(`${paymentResponse.razorpay_order_id}|${paymentResponse.razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== paymentResponse.razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed: Invalid signature." });
    }

    if (!Array.isArray(orderPayload.cart) || orderPayload.cart.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty." });
    }

    // Use GETDEL for perfect atomicity (prevents check-then-act race conditions)
    const redisKey = `rzp_payload:${paymentResponse.razorpay_order_id}`;
    const payloadStr = await connection.getdel(redisKey);
    
    if (!payloadStr) {
      // It was already processed either by the webhook or a duplicate client request
      return res.status(200).json({ status: "processing", message: "Order already captured" });
    }

    // Hand off to queue
    const jobId = await enqueueOrder(orderPayload, paymentResponse, userId);

    res.status(200).json({ status: "processing", jobId });
  } catch (err) {
    next(err);
  }
};

export const getRazorpayLogs = async (req, res, next) => {
  try {
    const getOrderDetails = await razorpay.payments.all();
    res.status(200).json({ getOrderDetails });
  } catch (err) {
    next(err);
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (secret) {
      const signature = req.headers['x-razorpay-signature'];
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest !== signature) {
        return res.status(400).send("Invalid signature");
      }
    }

    if (req.body.event === 'order.paid' || req.body.event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      
      // Use atomic GETDEL to ensure we are the only ones processing this payload
      const redisKey = `rzp_payload:${orderId}`;
      const payloadStr = await connection.getdel(redisKey);
      
      if (payloadStr) {
        // We secured the lock! This means the client dropped off and didn't call finalize yet.
        const { orderPayload, userId } = JSON.parse(payloadStr);
        
        const paymentResponse = {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: "webhook_verified", // Worker doesn't verify this again
        };
        
        await enqueueOrder(orderPayload, paymentResponse, userId);
      }
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send('Error');
  }
};
