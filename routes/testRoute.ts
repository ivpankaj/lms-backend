import { Router } from 'express';
import { authenticateToken } from '../middleware/middleware';
import { getTestById, getTests } from '../controllers/testController';

const router = Router();

router.get('/tests', getTests);
router.get('/tests/:id', authenticateToken, getTestById);


export default router;