import express from 'express';

import roleRoutes from './role/route'
import moduleMasterRoutes from './module_master/route'
import roleAssignModuleRoutes from './role_assign_module/route'

const router = express.Router();


router.use("/role", roleRoutes)
router.use("/module_master", moduleMasterRoutes)
router.use("/role_assign_module", roleAssignModuleRoutes)

export default router;