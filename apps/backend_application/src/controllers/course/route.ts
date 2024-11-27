import express from 'express';
import handler from './handler';
import { authentication } from '@adya/shared';
import {
  validate,
  listCacheCoursesSchema,
  listMyCoursesSchema,
  saveCourseSchema,
  getCourseDetailSchema,
  enrollCourseSchema,
  paymentSchema,
  adminListCoursesSchema,
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance();

// Course management routes
router.post('/create', authentication, newHandler.create);
router.get('/get_my_course/:id', authentication, validate(getCourseDetailSchema), newHandler.get);
router.get('/order/list', authentication, validate(listMyCoursesSchema), newHandler.listMyCourses);
router.get('/get/:id', authentication, validate(getCourseDetailSchema), newHandler.getCacheCourse);
router.get('/list', validate(listCacheCoursesSchema), newHandler.listCacheCourses);
router.get('/landing_page/list', authentication, validate(listCacheCoursesSchema), newHandler.landingPageCacheCourses);
router.get('/home_page/list', authentication, newHandler.homePagelist);
router.get('/cache_course/list', authentication, validate(listCacheCoursesSchema), newHandler.listCacheCourses);
router.get('/landing_page/scholarship', authentication, newHandler.listScholarship);
router.post('/enroll', authentication, validate(enrollCourseSchema), newHandler.enrolled);
router.post('/save_course', authentication, validate(saveCourseSchema), newHandler.saveCourse);
router.get('/get_course/:id', authentication, validate(getCourseDetailSchema), newHandler.CourseDetail);
router.get('/get_filters', authentication, newHandler.filterDetail);
router.post('/payment', authentication, validate(paymentSchema), newHandler.payment);
router.get('/get_recommended_courses', authentication, newHandler.recommendedCourses);

// Admin routes
router.get('/admin/list', authentication, validate(adminListCoursesSchema), newHandler.listAllCourses);
router.get('/admin/getAllCertificate', authentication, newHandler.getAllCertificate);
router.get('/events', newHandler.getOnAction);

export default router;
