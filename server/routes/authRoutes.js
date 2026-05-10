import express from 'express';
import { register, login, getMe, updateProfile, changePassword, saveDestination, removeDestination, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/password', protect, changePassword);
router.post('/destinations', protect, saveDestination);
router.delete('/destinations/:index', protect, removeDestination);
router.delete('/account', protect, deleteAccount);

export default router;
