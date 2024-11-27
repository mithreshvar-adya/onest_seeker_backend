import express from 'express';
import handler from './handler';
import { authentication } from '@adya/shared';

const router = express.Router();
const newHandler = handler.getInstance();

//api for creating db 
// router.post('/post/jobs', newHandler.postJobs);
// router.post('/post/job', newHandler.postJob);

router.post('/createCacheJob', newHandler.createCacheJob)
router.get('/getCacheJobs/:id', authentication, newHandler.getCacheJobs)
router.get('/get_filters',authentication, newHandler.getFilterData)
router.get('/list', newHandler.listJobs);

router.get('/get/jobs', authentication, newHandler.getAllCacheJobs); //all jobs
router.get('/get_job/:id', authentication,newHandler.getACacheJobDetail); //single description about job
router.post('/save_job',authentication,newHandler.saveJob) //save job
router.post('/apply_job', authentication,newHandler.applyJob); //apply job
router.get('/get_my_jobs',authentication, newHandler.getMyJoblist); //myjobs list
router.get('/get_my_job/:id',authentication, newHandler.getMyJob); //myjob single
router.get('/get_recommended_jobs',authentication, newHandler.recommendedJobs)

router.get('/admin/getAllJobListing', authentication, newHandler.getAllJobListing)
router.get('/admin/getAllJobProvider', authentication, newHandler.getAllJobProvider)
router.get('/admin/getAllApplication', authentication, newHandler.getAllApplication)


router.get('/get_job_order/:transaction_id', authentication, newHandler.getJobOrderByTransactionId)





export default router;
