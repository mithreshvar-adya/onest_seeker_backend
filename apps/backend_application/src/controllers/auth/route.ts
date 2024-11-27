import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";
import { 
    validate, 
    loginSchema, 
    verifyOtpSchema, 
    createUserSchema, 
    updateUserSchema,
    updateProfileSchema 
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance()

// Auth routes
router.post('/login', validate(loginSchema), newHandler.login);
router.post('/verify-otp', validate(verifyOtpSchema), newHandler.verify_otp);

// User management routes
router.post('/create', validate(createUserSchema), newHandler.create);
router.get('/get/:id', authentication, newHandler.get);
router.post('/:id/update', authentication, validate(updateUserSchema), newHandler.update);
router.get('/', authentication, newHandler.list);
router.delete('/:id', authentication, newHandler.delete);

// Profile routes
router.get('/:id/profile', authentication, newHandler.getProfileItems);
router.post('/:id/profile', authentication, validate(updateProfileSchema), newHandler.updateUserProfile);
router.post('/:id/profile/items', authentication, newHandler.addProfileItems);
router.put('/:id/profile/items', authentication, newHandler.updateProfileItems);
router.delete('/:id/profile/items', authentication, newHandler.deleteProfileItems);

// Admin routes
router.get('/admin/users', authentication, newHandler.adminUserList);

export default router