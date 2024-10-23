import { Router } from 'express'
import multer from "multer";
import path from 'path';
import { AdminCreate, AdminCreateCourse, AdminCreateTopic, AdminGet, AdminDashboardTotal, AdminDeleteTopic, AdminGetAllCourseList, AdminGetAllTopicList, AdminLogin, AdminUpdateTopic, AdminDashboardTotalCourseList, AdminResetPassword } from '../controllers/AdminController';
import { deleteTest, getTestById, getTests, updateTest, uploadTestPdf } from '../controllers/testController';
import { adminAuthmiddleware } from '../middleware/adminMiddleware';
import { create, DeleteFunction, findAll, get, getStudentFeesRevenue, resetPassword, StudentAnalatics, StudentAnalaticsTwo, updateStudent, updateStudentByAdmin } from '../controllers/userController';
import { createBatch, updateBatch, deleteBatch, getAllBatch, getSingleBatch } from '../controllers/BatchController'
import { CounsellorCourseList, createCounselor, deleteCounselor, get_all_counsellor, get_counselLor_by_id, updateCounselor } from '../controllers/counsellor_registration';
import { createMCQAll, deleteMCQ, getAllMCQs, getAllMCQsForAdmin, getMCQById, updateMCQ } from '../controllers/mcqController';
import { createNotesFunction, deleteNotesFunction, getByCourseIdFunction, getNotesFunction } from '../controllers/notesController';
import { createProject, deleteProject, getAllProjects, getSingleProject, updateProject } from '../controllers/projectController';
import { FullStackWebDevelopmentCreate, FullStackWebDevelopmentGet } from '../controllers/fullstackWebDeveloper';
import { createTeacher, updateTeacher, deleteTeacher, getAllTeachers, getTeacherById } from '../controllers/teacherController'
import { deleteCourseVideo, getAllCoursePdf, getAllVideos, getCoursePdf, getCourseVideo, updateCourseVideo, uploadCoursePdf, uploadCourseVideo } from '../controllers/UploadController';
import { getActivitiesByUserId, getAllActivities, deleteActivity } from '../controllers/studentActivityController'
import { deleteCourse, GetCourseById, updateCourse } from '../controllers/courseController';

import { createNotification, deleteNotification, getAllNotificaions, getNotification, updateNotification } from '../controllers/notificationController'


const router = Router();


const PdfStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, 'uploads/pdfFiles');
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadPdf = multer({ storage: PdfStorage }).single('pdfFile');



router.post('/admin/create', AdminCreate);
router.post('/admin/login', AdminLogin);
router.put('/admin/reset-password', AdminResetPassword);

router.get('/admin/get', adminAuthmiddleware, AdminGet);

// User Related Routes
router.post('/admin/student/create', adminAuthmiddleware, create);
router.put('/admin/student/update/:id', adminAuthmiddleware, updateStudentByAdmin)
router.get('/admin/student/getAll', adminAuthmiddleware, findAll);
router.get('/admin/student/:id', adminAuthmiddleware, get);
router.delete('/admin/student/delete/:id', adminAuthmiddleware, DeleteFunction);


//student's analatics
router.get('/admin/student/analatics/get',adminAuthmiddleware,StudentAnalatics)
router.get('/admin/dashboard/student/total/analytics',adminAuthmiddleware,StudentAnalaticsTwo)

//create notifications
// Define routes

router.post('/admin/notification/create',adminAuthmiddleware, createNotification);
router.put('/admin/notifications/:id',adminAuthmiddleware, updateNotification);
router.delete('/admin/notifications/:id',adminAuthmiddleware, deleteNotification);
// router.get('/admin/notifications/:id', getNotification);
router.get('/admin/notifications/all',adminAuthmiddleware, getAllNotificaions);


//course Routes
router.post('/admin/course/create', adminAuthmiddleware, AdminCreateCourse)
router.get('/admin/course/getall', AdminGetAllCourseList);
router.get('/admin/course/:id', adminAuthmiddleware, GetCourseById);
router.put('/admin/course/update/:id', adminAuthmiddleware, updateCourse);
router.delete('/admin/course/delete/:id', adminAuthmiddleware, deleteCourse);

//
//get all student count course sell total courses total trainer
router.get('/admin/dashboard/total', adminAuthmiddleware, AdminDashboardTotal)

//get all course list on dashboard 
router.get('/admin/getAll/course/list',adminAuthmiddleware,AdminDashboardTotalCourseList)
//topic route
router.post('/admin/topic/create', adminAuthmiddleware, AdminCreateTopic)
router.put('/admin/topic/update/:topicId', adminAuthmiddleware, AdminUpdateTopic)
router.delete('/admin/topic/delete/:topicId', adminAuthmiddleware, AdminDeleteTopic)
router.get('/admin/topic/:courseId', adminAuthmiddleware, AdminGetAllTopicList);
router.get('/admin/topic/getall/:courseId', adminAuthmiddleware, AdminGetAllTopicList)

// Test Routes
router.get('/admin/tests', adminAuthmiddleware, getTests);
router.get('/admin/tests/:id', adminAuthmiddleware, getTestById);
router.post('/admin/tests', adminAuthmiddleware, uploadPdf, uploadTestPdf);
router.put('/admin/tests/:id', adminAuthmiddleware, uploadPdf, updateTest);
router.delete('/admin/tests/:id', adminAuthmiddleware, deleteTest);


// //send notification to all admin panel 
// router.get('/students', fetchStudents);
// router.get('/students/:id', fetchStudentById);
// router.get('/students/batch/:batchId', fetchStudentsByBatch);

//get student gees revenue
router.get('/admin/student-fees-revenue',adminAuthmiddleware,getStudentFeesRevenue)

// Batch Routes
router.post('/admin/batch/create', adminAuthmiddleware, createBatch)
router.put('/admin/batch/update/:id', adminAuthmiddleware, updateBatch)
router.delete('/admin/batch/delete/:id', adminAuthmiddleware, deleteBatch)
router.get('/admin/batch/getAll', adminAuthmiddleware, getAllBatch)
router.get('/admin/batch/:id', adminAuthmiddleware, getSingleBatch)


// Counselor Routes
router.post('/admin/counsellor/create', adminAuthmiddleware, createCounselor);
router.get('/admin/counsellor/:id', adminAuthmiddleware, get_counselLor_by_id);
router.get('/admin/counsellors/getall', adminAuthmiddleware, get_all_counsellor);
router.put('/admin/counsellor/update/:id', adminAuthmiddleware, updateCounselor)
router.delete('/admin/counsellor/delete/:id', adminAuthmiddleware, deleteCounselor)
router.get('/admin/counsellor/course/getlist', adminAuthmiddleware, CounsellorCourseList);


// MCQ Routes
router.get('/admin/mcq/getAll', adminAuthmiddleware, getAllMCQsForAdmin);
router.get('/admin/mcq/getbyid/:id', adminAuthmiddleware, getMCQById);
router.post('/admin/mcq/allCreate', adminAuthmiddleware, createMCQAll)
router.put('/admin/mcq/update/:id', adminAuthmiddleware, updateMCQ)
router.delete('/admin/mcq/delete/:id', adminAuthmiddleware, deleteMCQ)


// Notes Routes
router.post('/admin/notes/create', adminAuthmiddleware, createNotesFunction);
router.put('/admin/notes/delete/:id', adminAuthmiddleware, deleteNotesFunction);
router.get('/admin/notes/getAll', adminAuthmiddleware, getNotesFunction);
router.get('/admin/notes/getByCourseId/:id', adminAuthmiddleware, getByCourseIdFunction);


// Projects Routes
router.post('/admin/project/create', adminAuthmiddleware, createProject);
router.get('/admin/project/getAll', adminAuthmiddleware, getAllProjects);
router.get('/admin/project/getbyid/:id', adminAuthmiddleware, getSingleProject);
router.delete('/admin/project/delete/:id', adminAuthmiddleware, deleteProject);
router.put('/admin/project/:id', adminAuthmiddleware, updateProject);


// Syllabus Routes
router.post('/admin/fullstack/web/create', adminAuthmiddleware, FullStackWebDevelopmentCreate);
router.get('/admin/fullstack/web/getAll', adminAuthmiddleware, FullStackWebDevelopmentGet);


// Teacher Routes
router.post('/admin/teacher/register', adminAuthmiddleware, createTeacher)
router.put('/admin/teacher/:id', adminAuthmiddleware, updateTeacher)
router.put('/admin/teacher/del/:id', adminAuthmiddleware, deleteTeacher)
router.get('/admin/teacher/getAll', adminAuthmiddleware, getAllTeachers)
router.get('/admin/teacher/:id', adminAuthmiddleware, getTeacherById)


// Upload Routes
// Videos
router.post('/admin/uploadVideo', adminAuthmiddleware, uploadCourseVideo);
router.get('/admin/video', adminAuthmiddleware, getAllVideos);
router.get('/admin/video/get/:id', adminAuthmiddleware, getCourseVideo);
router.put('/admin/video/:videoId', adminAuthmiddleware, updateCourseVideo);
router.delete('/admin/video/:videoId', adminAuthmiddleware, deleteCourseVideo);

//pdf
router.post('/admin/upload/pdf', adminAuthmiddleware, uploadCoursePdf);
router.get('/admin/pdf/get/:id', adminAuthmiddleware, getCoursePdf);
router.get('/admin/pdf/getAll', adminAuthmiddleware, getAllCoursePdf);


// User Activity Routes
router.get('/admin/activity/userId', adminAuthmiddleware, getActivitiesByUserId);
router.get('/admin/activities', adminAuthmiddleware, getAllActivities);
router.delete('/admin/activity/:id', adminAuthmiddleware, deleteActivity);

//admin meeting


export default router;