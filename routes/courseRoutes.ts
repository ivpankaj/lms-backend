import { Router } from 'express';
import {authenticateToken} from '../middleware/middleware';
import { getCourseOrder, PurchaseCourse, verifyPayment } from '../controllers/courseController';
import { PurchaseCourseInstaMojo } from '../controllers/courseControllerInstaMojo';


const router = Router();

router.post('/course/purchase/:courseId',PurchaseCourse );
router.post('/course/get/:order_id',getCourseOrder );
router.post('/course/verify/:order_id',verifyPayment);

//throught insta mojo payment gatway 

router.post('/course/purchase/instamojo/:courseId',PurchaseCourseInstaMojo)

export default router;