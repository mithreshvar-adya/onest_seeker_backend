import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";
import { updateSchema, validate } from './validation';
import { createSchema } from './validation';

const router = express.Router();
const newHandler = handler.getInstance()


router.post('/create', validate(createSchema), newHandler.create);
router.get('/get/:id', authentication, newHandler.get);
router.get('/', newHandler.list)
router.post('/:id/update', validate(updateSchema), newHandler.update);
// router.delete('/get/:id',authentication,newHandler.delete);





export default router