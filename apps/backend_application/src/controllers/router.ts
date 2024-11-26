import express from 'express';
import clientFeedbackRoutes from './client_feedback/route'

const router = express.Router();



router.use("/client_feedback",clientFeedbackRoutes)


export default router;