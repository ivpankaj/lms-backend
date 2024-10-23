import ContactUsForm from "../models/contactUsForm";
import {Request,Response} from 'express';
import { FullStackWebDevelopment } from "../models/fullStackWebDevelopment";

export const FullStackWebDevelopmentCreate =async(req:Request, res:Response)=>{
    try{
    const add = await  FullStackWebDevelopment.create(req.body);
    res.status(200).send({message : 'full stack course created successfully', status : true})
    }catch(err){
          return res.send({message : 'internal server error'})
    }
}

export const FullStackWebDevelopmentGet =async(req:Request, res:Response)=>{
    try{
    const data = await FullStackWebDevelopment.findAll();
    res.status(200).send({message : 'all data', status : true , data : data})
    }catch(err){
          return res.send({message : 'internal server error'})
    }
}

