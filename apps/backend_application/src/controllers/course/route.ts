import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()

router.post('/create',newHandler.create);
// router.get('/',authentication,newHandler.list)
router.post('/:id/update',authentication,newHandler.update);

/////////// order db //////////
router.get('/get_my_course/:id',authentication,newHandler.get);
router.get('/order/list',authentication,newHandler.listMyCourses)

/////////// cache db//////////
router.get('/get/:id',authentication,newHandler.getCacheCourse);
router.get('/list',newHandler.listCacheCourses)
router.get('/landing_page/list',authentication,newHandler.landingPageCacheCourses)
router.get('/home_page/list',authentication,newHandler.homePagelist)
router.get('/cache_course/list',authentication,newHandler.listCacheCourses)
router.get('/landing_page/scholarship',authentication,newHandler.listScholarship)
router.post('/enroll',authentication,newHandler.enrolled);
router.post('/save_course',authentication,newHandler.saveCourse)
router.get('/get_course/:id',authentication,newHandler.CourseDetail);
router.get('/get_filters',authentication,newHandler.filterDetail);
router.post('/payment',authentication,newHandler.payment);
router.get('/get_recommended_courses',authentication, newHandler.recommendedCourses)

router.get('/admin/list', authentication, newHandler.listAllCourses) //authentication
router.get('/admin/getAllCertificate', authentication, newHandler.getAllCertificate)

router.get('/events', newHandler.getOnAction)

export default router