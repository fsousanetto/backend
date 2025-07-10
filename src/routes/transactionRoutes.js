import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as R from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/total-income', authMiddleware, R.getTotalIncome);
router.get('/total-expense', authMiddleware, R.getTotalExpense);
router.get('/history', authMiddleware, R.getHistory);
router.get('/recent', authMiddleware, R.getRecent);
router.post('/', authMiddleware, R.createTransaction);
router.get('/', authMiddleware, R.getTransactions);
router.put('/:id', authMiddleware, R.updateTransactions);
router.delete('/:id', authMiddleware, R.deleteTransaction);

export default router;