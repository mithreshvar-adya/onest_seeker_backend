import express from 'express';
import handler from './handler'
import { authentication } from "@adya/shared";
import { validate, schemas } from './validation';

const router = express.Router();
const newHandler = handler.getInstance()

// Auth routes
router.post('/login', validate(schemas.login), newHandler.login);
router.post('/verify_otp', validate(schemas.verifyOtp), newHandler.verify_otp);

// User management routes
router.post('/create', validate(schemas.createUser), newHandler.create);
router.get('/get/:id', authentication, newHandler.get);
router.post('/:id/update', authentication, validate(schemas.updateUser), newHandler.update);
router.get('/', authentication, newHandler.list);
router.delete('/:id', authentication, newHandler.delete);

// Profile routes
router.get('/:id/profile', authentication, newHandler.getProfileItems);
router.post('/:id/profile', authentication, validate(schemas.updateProfile), newHandler.updateUserProfile);
router.post('/:id/profile/items', authentication, newHandler.addProfileItems);
router.put('/:id/profile/items', authentication, newHandler.updateProfileItems);
router.delete('/:id/profile/items', authentication, newHandler.deleteProfileItems);

// Admin routes
router.get('/admin/users', authentication, newHandler.adminUserList);

export default router