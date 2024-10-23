import { Router } from 'express';
import { createProject, getAllProjects, getSingleProject } from '../controllers/projectController';

const router = Router();

router.post('/project/create', createProject);
// router.get('/questions', getAllQuestions);
router.get('/project/getAll', getAllProjects);
router.get('/project/getbyid/:id/', getSingleProject);

export default router;