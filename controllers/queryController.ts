import QueryForm from "../models/studentQuery";
import {Request,Response} from 'express';

export const createQueryFormEntry =async(req:Request, res:Response)=>{
    try{
    const add = QueryForm.create(req.body);
    res.status(200).send({message : 'query created successfully', status : true})
    }catch(err){
          return res.send({message : 'internal server error'})
    }
}


