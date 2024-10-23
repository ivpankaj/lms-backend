import { fstat } from "fs";
import ContactUsForm from "../models/contactUsForm";
import {Request,Response} from 'express';

export const creatContactUsFormEntry =async(req:Request, res:Response)=>{
    try{
    const add = ContactUsForm.create(req.body);
    res.status(200).send({message : 'contact form filled successfully', status : true})
    }catch(err){
          return res.send({message : 'internal server error'})
    }
}

























