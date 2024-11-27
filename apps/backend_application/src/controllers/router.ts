import express from 'express';
import clientFeedbackRoutes from './client_feedback/route';
import authRoutes from './auth/route';
import accessModuleRoutes from './access_module/router';
const router = express.Router();

router.use('/client_feedback', clientFeedbackRoutes);
router.use('/auth', authRoutes);
router.use('/access_module', accessModuleRoutes);
export default router;
