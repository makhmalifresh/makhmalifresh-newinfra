import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as settingController from '../controllers/setting.controller.js';
import { verifyAdminJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public admin login
router.post('/login', adminController.login);

// Protect all following routes
router.use(verifyAdminJWT);

// Settings
router.put('/settings/store-status', settingController.updateStoreStatusAdmin);
router.put('/settings/platform-fee', settingController.updatePlatformFeeAdmin);
router.put('/settings/surge-fee', settingController.updateSurgeFeeAdmin);
router.put('/settings/delivery-mode', settingController.updateDeliveryModeAdmin);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/pending', adminController.getPendingOrders);
router.post('/orders/:orderId/manual-book', adminController.manualBookOrder);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.put('/products/:id/toggle-availability', adminController.toggleProductAvailability);

// Offers & Coupons
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.delete('/offers/:id', adminController.deleteOffer);

router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);
router.get('/unassigned-coupons', adminController.getUnassignedCoupons);

export default router;
