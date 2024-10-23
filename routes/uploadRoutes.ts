import {Router} from 'express';
import { getAllCoursePdf, getAllVideos, getCoursePdf, getCourseVideo, uploadCoursePdf, uploadCourseVideo } from '../controllers/UploadController';

const router = Router();

// upload video
router.get('/video', getAllVideos);
router.get('/video/get/:id', getCourseVideo);

//upload pdf
router.get('/pdf/get/:id', getCoursePdf);
router.get('/pdf/getAll', getAllCoursePdf);

export default router