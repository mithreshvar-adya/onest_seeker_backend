import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";

const router = express.Router();
const newHandler = handler.getInstance()

router.post('/create',authentication, newHandler.create); 
router.get('/get/:id',authentication, newHandler.get); 
router.get('/',newHandler.list) 
// router.get('/list',authentication,newHandler.rolelist)
router.get('/findWithRole/:id',authentication, newHandler.findWithRole)

router.post('/:id/update',authentication, newHandler.update); 
router.delete('/:id/delete',authentication, newHandler.delete);

export default router
