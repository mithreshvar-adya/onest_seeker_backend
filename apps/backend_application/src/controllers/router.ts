import express from 'express';
import clientFeedbackRoutes from './client_feedback/route';
import authRoutes from './auth/route';
import accessModuleRoutes from './access_module/router';
import courseRoutes from './course/route';
import jobRoutes from './jobs/route';
const router = express.Router();

router.use('/client_feedback', clientFeedbackRoutes);
router.use('/auth', authRoutes);
router.use('/access_module', accessModuleRoutes);
router.use('/course', courseRoutes);
router.use('/jobs', jobRoutes);

export default router;
