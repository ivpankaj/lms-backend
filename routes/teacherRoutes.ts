import express from 'express';
import { adminAuthmiddleware } from '../middleware/adminMiddleware';
import { createTeacher, deleteTeacher, getAllTeachers, getTeacherById, updateTeacher } from '../controllers/teacherController';


const router = express.Router();

router.post('/teacher/register', adminAuthmiddleware, createTeacher)
router.put('/teacher/:id', adminAuthmiddleware, updateTeacher)
router.put('/teacher/del/:id', adminAuthmiddleware, deleteTeacher)
router.get('/teacher/getAll', adminAuthmiddleware, getAllTeachers)
router.get('/teacher/:id', adminAuthmiddleware, getTeacherById)

export default router;