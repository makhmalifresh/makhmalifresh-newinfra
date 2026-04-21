import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyUserJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/orders/my-orders', verifyUserJWT, orderController.getMyOrders);
router.get('/addresses', verifyUserJWT, orderController.getMyAddresses);
router.post('/addresses', verifyUserJWT, orderController.saveAddress);

export default router;
