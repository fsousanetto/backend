import express from 'express';
import { getBalance } from '../controllers/walletController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/balance', authMiddleware, getBalance);

export default router;
