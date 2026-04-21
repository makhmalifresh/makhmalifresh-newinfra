import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';

const router = Router();

router.get('/products', productController.getProducts);
router.get('/offers/active', productController.getActiveOffers);
router.post('/cart/validate-coupon', productController.validateCoupon);

export default router;
