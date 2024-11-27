import express from 'express';
import clientFeedbackRoutes from './client_feedback/route'
import accessModuleRoutes from './access_module/router'
import authRoutes from './auth/route'
const router = express.Router();



router.use("/client_feedback",clientFeedbackRoutes)
router.use("/access_module",accessModuleRoutes)
router.use("/auth",authRoutes)


export default router;