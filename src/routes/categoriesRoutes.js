import express from 'express';
import * as C from '../controllers/categoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, C.createCategory);
router.get('/', authMiddleware, C.getCategory);
router.put('/:id', authMiddleware, C.updateCategory);
router.delete('/:id', authMiddleware, C.deleteCategory);

export default router;