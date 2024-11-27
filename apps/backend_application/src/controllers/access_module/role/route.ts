import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";
import { 
    validate,
    createRoleSchema,
    updateRoleSchema,
    listQuerySchema,
    getByIdSchema,
    findWithRoleSchema,
    deleteSchema
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance()

router.post('/create', validate(createRoleSchema), newHandler.create); 
router.get('/get/:id',authentication, validate(getByIdSchema), newHandler.get); 
router.get('/',validate(listQuerySchema), newHandler.list) 
// router.get('/list',authentication,newHandler.rolelist)
router.get('/findWithRole/:id',authentication, validate(findWithRoleSchema), newHandler.findWithRole)

router.post('/:id/update',authentication, validate(updateRoleSchema), newHandler.update); 
router.delete('/:id/delete',authentication, validate(deleteSchema), newHandler.delete);

export default router
