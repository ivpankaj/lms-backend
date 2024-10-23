import { Router } from 'express';
import { createMeeting, deleteMeeting, getAllMeetings, getMeetingById, getMeetingsByCourseId, updateMeeting } from '../controllers/meeting';
import { adminAuthmiddleware } from '../middleware/adminMiddleware';


const router = Router();

// Route to create a new meeting
router.post('/meeting/create',adminAuthmiddleware, createMeeting);

// Route to get all meetings
router.get('/meeting/getall/:courseId', getMeetingsByCourseId);


router.get('/meeting/getall', getAllMeetings);
// Route to get a specific meeting by ID


router.get('/meeting/get/:id',adminAuthmiddleware, getMeetingById);

// Route to update a meeting
router.put('/meeting/update/:id', updateMeeting);

// Route to delete a meeting (soft delete)
router.delete('/meeting/delete/:id', deleteMeeting);

export default router;
