import express from 'express';
import { updateUserActivity, getActivitiesByUserId, getAllActivities, deleteActivity } from '../controllers/studentActivityController';
import { authenticateToken } from '../middleware/middleware';

const router = express.Router();

router.post('/activity', authenticateToken, updateUserActivity);
router.get('/activities', authenticateToken, getAllActivities)

export default router;