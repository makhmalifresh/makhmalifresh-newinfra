import Razorpay from 'razorpay';
import crypto from 'crypto';
import { enqueueOrder } from '../queues/order.queue.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { grandTotal } = req.body;
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

    // Hand off to queue
    const jobId = await enqueueOrder(orderPayload, paymentResponse, userId);

    res.status(200).json({ status: "processing", jobId });
  } catch (err) {
    next(err);
  }
};
