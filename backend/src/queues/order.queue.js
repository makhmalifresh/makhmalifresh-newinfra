import { connection } from '../config/redis.js';
import { eventBus } from '../utils/eventBus.js';

export const enqueueOrder = async (orderPayload, paymentResponse, userId) => {
  // Idempotency key logic can no longer rely on BullMQ native jobId constraints.
  // We'll store it explicitly in the job payload.
  const jobId = paymentResponse.razorpay_payment_id;
  
  const jobData = {
    orderPayload,
    paymentResponse,
    userId,
    jobId,
    timestamp: Date.now()
  };

  // Push to a raw Redis list
  await connection.lpush('makhmali:orderQueue', JSON.stringify(jobData));
  
  // Instantly wake up the local Node.js background worker saving Upstash polling commands
  eventBus.emit('new_order');
  
  return jobId;
};
