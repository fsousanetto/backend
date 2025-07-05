import express from 'express';
import * as C from '../controllers/userController.js';
import authMidleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMidleware, C.default.getUser)
router.get('/me', authMidleware, C.default.getUser)
router.put('/update/:id', authMidleware, C.default.updateUser)
router.post('/register', C.default.register)

export default router;