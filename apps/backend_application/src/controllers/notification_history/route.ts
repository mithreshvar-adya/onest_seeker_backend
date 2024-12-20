import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()


router.post('/create',newHandler.create);
router.get('/get/:id',authentication,newHandler.get);
router.get('/',authentication,newHandler.list)
router.post('/:id/update',authentication,newHandler.update);
// router.delete('/get/:id',authentication,newHandler.delete);





export default router