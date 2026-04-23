import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { verifyUserJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/payment/create-order', verifyUserJWT, paymentController.createRazorpayOrder);
// Verify Razorpay webhook/client signature and finalize payment inserting into queue
router.post('/order/finalize-payment', verifyUserJWT, paymentController.verifyAndSubmitPayment);

// Razorpay Webhook to handle client drop-offs
router.post('/payment/webhook', paymentController.razorpayWebhook);

export default router;
