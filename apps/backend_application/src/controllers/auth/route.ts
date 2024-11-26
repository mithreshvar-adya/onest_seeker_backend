import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()

// router.post('/test',newHandler.test);
router.post('/create',newHandler.create);
router.get('/get/:id',authentication,newHandler.get);
router.get('/',authentication,newHandler.list)
router.post('/:id/update',authentication,newHandler.update);
router.delete('/:id/delete',authentication,newHandler.delete);


//////////////////// user profile ////////////////////
router.get('/:id/get_profile_item',authentication,newHandler.getProfileItems);
router.post('/:id/add_profile_item',authentication,newHandler.addProfileItems);
router.post('/:id/update_profile_item',authentication,newHandler.updateProfileItems);
router.post('/:id/update_profile',authentication,newHandler.updateUserProfile);
router.post('/:id/delete_profile_item',authentication,newHandler.deleteProfileItems);

router.post('/login',newHandler.login);
router.post('/verify_otp',newHandler.verify_otp);

router.get('/admin/list',authentication,newHandler.adminUserList)


export default router