import { Router } from "express";

import { createQueryFormEntry } from "../controllers/queryController";

import { createCounselorFormEntry } from "../controllers/counsellorController";
import { creatContactUsFormEntry } from "../controllers/contactController";

import {SkillOnTimeHomePageImageSliderFunction,SkillOnTimeHomePageImageSliderGetAllFunction, deleteHomePageSliderImageById} from "../controllers/commonController";

const router = Router();

router.post('/create/query/form',createQueryFormEntry);
router.post('/create/counselor/form',createCounselorFormEntry);
router.post('/create/contact/form',creatContactUsFormEntry);


//image slider image for www.skillontime.com home page images 
//this one for craete and update 
router.post('/skillontime/home/imageslider/:id', SkillOnTimeHomePageImageSliderFunction);
//this one for get all
router.get('/skillontime/getAll/images',SkillOnTimeHomePageImageSliderGetAllFunction)
//this one for delte
router.delete('/skillontime/update/id',deleteHomePageSliderImageById)

export default router;