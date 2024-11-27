import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";
import { 
    validate,
    createRoleAssignModuleSchema,
    createBulkRoleAssignModuleSchema,
    updateRoleAssignModuleSchema,
    listQuerySchema,
    getByIdSchema,
    deleteSchema
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance()

router.post('/create',authentication, validate(createBulkRoleAssignModuleSchema), newHandler.create); 
router.get('/get/:id',authentication,validate(getByIdSchema),newHandler.get);
router.get('/',authentication,validate(listQuerySchema),newHandler.list)
router.post('/update',authentication,validate(updateRoleAssignModuleSchema),newHandler.update);
router.delete('/:id/delete',authentication,validate(deleteSchema),newHandler.delete);

export default router