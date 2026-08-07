import { Router } from 'express';
import { pagbankWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/pagbank', pagbankWebhook);

export default router;
