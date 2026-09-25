import { Router } from 'express';
import { createPayment, getPaymentStatus, getPlans } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/plans', getPlans);
router.post('/create', requireAuth, createPayment);
router.get('/status/:paymentId', requireAuth, getPaymentStatus);
export default router;
