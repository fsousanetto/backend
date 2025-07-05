import express from 'express';
import { login, refreshToken, logout, loginWithGoogle } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/google', loginWithGoogle);

export default router;