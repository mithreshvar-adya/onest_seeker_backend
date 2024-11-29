import express from 'express';
import handler from './handler';
import { authentication } from '@adya/shared';
import { 
    validate,
    listJobsSchema,
    getJobDetailSchema,
    saveJobSchema,
    applyJobSchema,
    adminListJobsSchema,
    getJobOrderSchema
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance();

// Public routes
router.get('/list', validate(listJobsSchema), newHandler.listJobs);

// Authenticated routes
router.get('/get_filters', newHandler.getFilterData);
router.get('/get/jobs', validate(listJobsSchema), newHandler.getAllCacheJobs);
router.get('/get_job/:id', validate(getJobDetailSchema), newHandler.getACacheJobDetail);
router.post('/save_job', authentication, validate(saveJobSchema), newHandler.saveJob);
router.post('/apply_job', authentication, validate(applyJobSchema), newHandler.applyJob);
router.get('/get_my_jobs', authentication, validate(listJobsSchema), newHandler.getMyJoblist);
router.get('/get_my_job/:id', authentication, validate(getJobDetailSchema), newHandler.getMyJob);
router.get('/get_recommended_jobs', authentication, validate(listJobsSchema), newHandler.recommendedJobs);

// Admin routes
router.get('/admin/getAllJobListing', authentication, validate(adminListJobsSchema), newHandler.getAllJobListing);
router.get('/admin/getAllJobProvider', authentication, validate(adminListJobsSchema), newHandler.getAllJobProvider);
router.get('/admin/getAllApplication', authentication, validate(adminListJobsSchema), newHandler.getAllApplication);
router.get('/get_job_order/:transaction_id', authentication, validate(getJobOrderSchema), newHandler.getJobOrderByTransactionId);

export default router;
