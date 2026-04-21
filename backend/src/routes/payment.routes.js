import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { verifyUserJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/payment/create-order', paymentController.createRazorpayOrder);
// Verify Razorpay webhook/client signature and finalize payment inserting into queue
router.post('/order/finalize-payment', verifyUserJWT, paymentController.verifyAndSubmitPayment);

export default router;
