import { Router } from 'express';
import * as settingController from '../controllers/setting.controller.js';

const router = Router();

router.get('/settings/store-status', settingController.getStoreStatusPublic);
router.get('/settings/platform-fee', settingController.getPlatformFeePublic);
router.get('/settings/surge-fee', settingController.getSurgeFeePublic);
router.get('/settings/delivery-mode', settingController.getDeliveryModePublic);

export default router;
