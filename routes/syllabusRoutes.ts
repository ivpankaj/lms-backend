import {Router} from 'express';
import { FullStackWebDevelopmentGet } from '../controllers/fullstackWebDeveloper';
import { authenticateToken } from '../middleware/middleware';

const router = Router();

router.get('/fullstack/web/getAll', authenticateToken, FullStackWebDevelopmentGet);

export default router