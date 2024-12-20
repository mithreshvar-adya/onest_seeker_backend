import express from 'express';
import clientFeedbackRoutes from './client_feedback/route';
import authRoutes from './auth/route';
import accessModuleRoutes from './access_module/router';
import courseRoutes from './course/route';
import jobRoutes from './jobs/route';
import lookupRoutes from './lookup_code/route';
import dashboardRoutes from './dashboard/route';
const router = express.Router();

router.use('/client_feedback', clientFeedbackRoutes);
router.use('/auth', authRoutes);
router.use('/access_module', accessModuleRoutes);
router.use('/course', courseRoutes);
router.use('/jobs', jobRoutes);
router.use('/lookup_code', lookupRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
