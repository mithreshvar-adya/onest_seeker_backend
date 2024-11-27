import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()


router.post('/create',newHandler.createServerSettings);
router.get('/get/:id',authentication,newHandler.getServerSettings);
router.get('/',authentication,newHandler.listServerSettings)
router.post('/:id/update',authentication,newHandler.updateServerSettings);
// router.delete('/get/:id',authentication,newHandler.deleteServerSettings);

router.post('/user_server_settings/create',newHandler.createUserServerSettings);
router.get('/get/:id',authentication,newHandler.getUserServerSettings);
router.get('/',authentication,newHandler.listUserServerSettings)
router.post('/:id/update',authentication,newHandler.updateUserServerSettings);




export default router