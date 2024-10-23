import {Router} from 'express';
import { createNotesFunction, deleteNotesFunction, getByCourseIdFunction, getNotesFunction } from '../controllers/notesController';
import {authenticateToken} from '../middleware/middleware';

const router = Router();

router.get('/notes/getAll',authenticateToken,getNotesFunction);
router.get('/notes/getByCourseId/:id',authenticateToken,getByCourseIdFunction);

export default router;
