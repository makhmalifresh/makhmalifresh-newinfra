import { Router } from 'express';
import * as borzoController from '../controllers/borzo.controller.js';

const router = Router();

router.post('/borzo/calculate-fee', borzoController.calculateFee);

export default router;
