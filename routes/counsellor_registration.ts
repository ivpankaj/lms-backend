import express from 'express';
import { CounsellorCourseList, CounsellorGet, CounsellorLogin, CounsellorLogout, createCounselor, Decrypt, deleteCounselor, Encrypt, get_all_counsellor, get_counselLor_by_id, phonePay, updateCounselor } from '../controllers/counsellor_registration';
import { CounsellorauthenticateToken } from '../middleware/middleware';

import { checkStatus, PhonePayPaymentInitiate } from '../controllers/phonePayPaymentController';

const router = express.Router();

// router.get('/counsellor_all',get_all_counsellor)
// router.get('/counsellor/:id',get_counselLor_by_id);
// router.put('/counsellor/:id', updateCounselor);
// router.delete('/counsellor/:id', deleteCounselor);

//login 
router.post('/counsellor/login', CounsellorLogin);
router.post('/counsellor/logout', CounsellorLogout);

//get counselor after login 
router.get('/counsellor/getByToken',CounsellorauthenticateToken, CounsellorGet);

// router.get('/payment',)

router.post('/Encrypt', Encrypt)
router.get('/Decrypt', Decrypt)

//pay using phone pay payment gatway api 
// router.post('/phone/pay',phonePay);
// router.post('/phone/pay',newPayment)

//phone pay payment controller
router.post('/phone/pay',PhonePayPaymentInitiate)
router.post('/status/:txnId', checkStatus);


router.get('/counsellor/course/getlist',CounsellorauthenticateToken,CounsellorCourseList);
// router.get('/counsellor/course/getlist', CounsellorauthenticateToken, CounsellorCourseList);

export default router;