import CounselorForm from "../models/counselorForm";
import {Request,Response} from 'express';

export const createCounselorFormEntry =async(req:Request, res:Response)=>{
    try{
    const add = CounselorForm.create(req.body);
    res.status(200).send({message : 'query created successfully', status : true})
    }catch(err){
          return res.send({message : 'internal server error'})
    }
}


