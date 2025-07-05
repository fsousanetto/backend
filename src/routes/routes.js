import express from 'express';
import userRoutes from './userRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import categoriesRoutes from './categoriesRoutes.js';
import authRoutes from './authRoutes.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import walletRoutes from './walletRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes)
router.use('/users', authMiddleware, userRoutes);
router.use('/transactions', authMiddleware, transactionRoutes);
router.use('/categories', authMiddleware, categoriesRoutes);
router.use('/wallet', walletRoutes);

export default router;