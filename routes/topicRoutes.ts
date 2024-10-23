import { Router } from 'express'
import { AdminGetAllTopicList } from '../controllers/AdminController';

const router = Router();

router.get('/topic/getall/:courseId', AdminGetAllTopicList)


export default router;