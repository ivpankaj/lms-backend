import { Router } from 'express';
import { getAllMCQs, getAllTitles, getMCQById, getPastResults, getQuestionsByTitle, SaveAnswers, saveUserAnswers } from '../controllers/mcqController';
import { authenticateToken } from '../middleware/middleware';

const router = Router();

router.get('/mcq/getAll', authenticateToken, getAllMCQs);
router.get('/mcq/getbyid/:id/',authenticateToken, getMCQById);
//save answer
router.post('/saveAnswers',authenticateToken,SaveAnswers)


//for specified mcq's 
router.get('/mcq/getTitles',authenticateToken, getAllTitles);
router.get('/mcq/getQuestionsByTitle/:titleId',authenticateToken, getQuestionsByTitle);
router.post('/mcq/saveAnswers',authenticateToken, saveUserAnswers);
router.get('/mcq/getPastResults/:titleId',authenticateToken,getPastResults)

export default router;