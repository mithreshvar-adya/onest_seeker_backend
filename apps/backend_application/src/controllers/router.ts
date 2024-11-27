import express from 'express';
import clientFeedbackRoutes from './client_feedback/route';
import authRoutes from './auth/route';

const router = express.Router();

router.use('/client_feedback', clientFeedbackRoutes);
router.use('/auth', authRoutes);

export default router;
