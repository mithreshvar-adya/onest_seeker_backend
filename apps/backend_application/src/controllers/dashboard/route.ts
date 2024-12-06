import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()

router.get('/total_count', newHandler.totalCount)
router.get('/course_status_count', newHandler.courseStatusCount)
router.get('/job_status_count', newHandler.jobStatusCount)
router.get('/course_list', newHandler.listMyCourses)
router.get('/job_list', newHandler.getMyJoblist)

export default router