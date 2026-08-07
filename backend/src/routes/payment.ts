import { Router } from 'express';
import { createPayment, getPaymentStatus } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', requireAuth, createPayment);
router.get('/status/:paymentId', requireAuth, getPaymentStatus);

export default router;
