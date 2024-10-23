import { Router } from 'express';
import { login, forgotPassword, forgotPasswordVerify, updateStudent, otpGenerate, forgotPasswordVerify3, Logout, updatePassword, BatchCreate, updateProfilePhoto, getProfilePhoto, checkReferalCode, ReferAndEarnMoney, get, getUsetByTokenId, createFreeSignup, GetAllCourseListForFreeRegistratioin, resetPassword, userLoginAndPasswordUpdate } from '../controllers/userController';
import { authenticateToken } from '../middleware/middleware';
import { getAllNotificationsForStudents } from '../controllers/notificationController';


const router = Router();

router.post('/student/otp-generate', otpGenerate);
router.patch('/student/update', authenticateToken, updateStudent);

//login route
router.post('/login', login);
router.get('/logout', authenticateToken, Logout);
router.post('/student/forgot-password', forgotPassword);
router.post('/student/forgot-password/verify', forgotPasswordVerify);
router.post('/student/forgot-password/reset-password', forgotPasswordVerify3);
router.post('/student/reset-password', resetPassword);


//user passwoerd forgot after login
router.post('/student/password/reset/afterlogin',authenticateToken,userLoginAndPasswordUpdate)

//get all notifications for student's
router.get('/students/notifications/all',authenticateToken, getAllNotificationsForStudents);


router.get('/student/get',authenticateToken, getUsetByTokenId);

//free student registration 
router.post('/student/free/create',createFreeSignup)
router.get('/student/free/get/course',GetAllCourseListForFreeRegistratioin)

// update profile photo of user 
router.post('/student/profilephoto', authenticateToken, updateProfilePhoto)
//update passowrd 
router.put('/password/update', authenticateToken, updatePassword);
//get profile photo
router.get('/profile-photo', authenticateToken, getProfilePhoto);
//check refereal code 
router.get('/student/refercode/:referalCode', checkReferalCode)
router.get('/referEarn', ReferAndEarnMoney)

export default router;