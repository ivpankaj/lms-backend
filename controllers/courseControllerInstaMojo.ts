
import { createUser, findAllUsers } from "../services/userService";
import { Sequelize, ValidationError, where } from "sequelize";

import bcrypt from "bcrypt"; // Assuming you're using bcrypt for password hashing
import jwt from "jsonwebtoken"; // For generating JWT tokens
import { Otp, Student } from "../models/userModel";
import {StudentCourseTable} from '../models/studentCourseModel';
import {CourseTable} from '../models/courseModel';
import {BatchModelTable} from '../models/batchModelTable';
import {StudentBatch} from '../models/studentBatch';
import {StudentCoursePurchased} from '../models/studentCoursePurchased';


import multer from 'multer';
import path from 'path';
import fs, { rmSync } from 'fs';




import { Request, Response } from 'express';
import crypto from 'crypto';
import { Cashfree } from 'cashfree-pg';
import { generateStrongPassword } from "./userController";
import { Op } from "sequelize";
import sequelize from "sequelize";
import { transporter } from "../middleware/nodeMailer";

Cashfree.XClientId = `${process.env.CLIENT_ID}`;
Cashfree.XClientSecret = `${process.env.CLIENT_SECRET}`;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// Order ID generation function
function GeneratedOrderId() {
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256');
  hash.update(uniqueId);
  const orderId = hash.digest('hex');
  return orderId.substr(0, 12);
}


// import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

//get token is done 
export const getToken = async (): Promise<TokenResponse> => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: '0GIclFJdsOBouRZ7XZ4AYi3vTwXlyudMoqM4rfVz',
      client_secret: 'iFfv8aKEZ3pYoXxlfqemNe24aRmUevGfIu4tFJL1XRl6BDBoJY9cuDw1NNI7u6uRwPswhdVoat670xGSDO9pMgzCdKAMAacKetIeQxLZ4XyxURQCbqGTM21DplqHyVwd'
    })
  };

  try {
    const response = await fetch('https://api.instamojo.com/oauth2/token/', options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

//now create pyment request 
interface PaymentRequestResponse {
  success: boolean;
  payment_request: {
    longurl: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const createPaymentRequest = async (
  amount: number,
  buyerName: string,
  purpose: string,
  redirectUrl: string,
  phone: string,
  email: string,
): Promise<PaymentRequestResponse> => {
  const options = {
    method: 'POST',
    headers: {
      'X-Api-Key': '2646073672a03dafd6235c32edefb868',
      'X-Auth-Token': 'cab4ee2c79ee594c4da1e835b14b5bfa',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: amount.toString(),
      buyer_name: buyerName,
      purpose: purpose,
      redirect_url: redirectUrl,
      phone: phone,
      send_email: 'True',
      send_sms: 'True',
      email: email,
      allow_repeated_payments: 'False',
    }),
  };

  try {
    const response = await fetch('https://api.instamojo.com/v2/payment_requests/', options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating payment request:', error);
    throw error;
  }
};



export const courseCreateFunction = async (req : Request, res : Response) =>{
  const create = await CourseTable.create(req.body);
  return res.send({message : 'course created ', data : create})
}


export const PurchaseCourseInstaMojo = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const {price} = req.body;
    
    const tokenResponse = await getToken();
    //now create funciton call

    const { amount, buyerName, purpose, redirectUrl, phone, email } = req.body;

    const apiKey = '2646073672a03dafd6235c32edefb868';
    const authToken = 'tcab4ee2c79ee594c4da1e835b14b5bfa';

      const paymentRequest = await createPaymentRequest(
        amount,
        buyerName,
        purpose,
        redirectUrl,
        phone,
        email,
      );
    //   res.json(paymentRequest);
    // res.json(tokenResponse);

    return res.send(paymentRequest);

    const order_amount = price ;
    // Request object for Cashfree
    const request = {
      order_amount: order_amount,
      order_currency: 'INR',
      order_id: GeneratedOrderId(),
      customer_details: {
        customer_id: courseId,
        customer_phone: req.body.mobile,
        customer_name: req.body.name,
        customer_email: req.body.email
      },
      order_meta: {
        return_url: 'https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}'
      }
    };

    // Create order with Cashfree
    const response = await Cashfree.PGCreateOrder('2022-09-01', request);

    // Extract relevant data
    const { data } = response;

    // Store order details in the student record

     // Create student entry in the database
     const finalResult = await StudentCoursePurchased.create({
      order_id : data?.order_id,
      order_amount : data?.order_amount,
      mobile : req.body.mobile,
      course_id : courseId,
      isPaymentDone : false
    });

    // Send response with relevant details
    res.send({
      message: 'Order created successfully',
      data: {
        order_id: data?.order_id,
        order_amount: data?.order_amount,
        order_currency: data?.order_currency,
        return_url: data?.order_meta?.return_url,
        payment_session_id: data?.payment_session_id
      }
    });

  }
  
  // catch (error) {

  catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    console.error('Internal server error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getCourseOrder = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
   
    // Fetch order from Cashfree
    const response = await Cashfree.PGFetchOrder('2022-09-01', order_id);
    
    // Check if response is valid
    if (response && response.data) {
      console.log('Order fetched successfully:', response.data);
      return res.send({
        message: 'Order fetched successfully',
        data: response.data
      });
    } else {
      console.error('Response or response data is undefined');
      return res.status(404).send({
        message: 'Order not found',
        data: null
      });
    }

  } catch (error) {
    // Check if error has a response with data
    const errorMessage = error|| 'Internal server error';
    console.error('Error:', errorMessage);
    
    return res.status(500).send({
      message: 'Internal server error',
      data: errorMessage
    });
  }
};


export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { courseId, name, mobile, email, referbyId } = req.body;
    const { order_id } = req.params;
    

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Send at least one key' });
    }

    // Fetch payment details from Cashfree
    const response = await Cashfree.PGOrderFetchPayments('2022-09-01', order_id);

    // Validate payment response
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.error('Response data is undefined or empty');
      return res.status(404).send({ message: 'Order not found' });
    }

    const paymentStatus = response.data[0]?.payment_status;
    if (paymentStatus !== "SUCCESS") {
      return res.status(500).send({ message: 'Payment failed' });
    }

    // Check if student already exists
    let student = await Student.findOne({ where: { contactNumber: mobile, emailAddress: email } });

    if (!student) {
      // Create a new student
      const strongPassword = generateStrongPassword({ contactnumber: mobile, emailaddress: email });
      const hashedPassword = await bcrypt.hash(strongPassword, 10);
      const studentId = `${email.slice(0, 4)}${Math.floor(10000 + Math.random() * 90000)}`;

      student = await Student.create({
        studentId,
        studentName: email.slice(0, 4),
        name,
        userName: email.slice(0, 4),
        contactNumber: mobile,
        emailAddress: email,
        password: hashedPassword,
        strongPassword,
        isPaymentDone: true,
        order_id: null,
        order_amount: 1, // Use actual amount as needed
      });

      // Send welcome email with username and password
      const mailOptions = {
        from: process.env.USER_NAME,
        to: student.emailAddress,
        subject: 'Welcome to Skillontime! Your Account Details',
        text: `Hi ${student.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${student.userName}\nPassword: ${student.strongPassword}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; }
              .container { width: 80%; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
              h1 { color: #007BFF; }
              .details { font-size: 16px; margin: 20px 0; }
              .footer { margin-top: 20px; font-size: 14px; color: #666; }
              .logo { width: 150px; height: auto; }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="https://skillontime.com/bg3.png" alt="Company Logo" class="logo">
              <h1>Welcome to Skillontime!</h1>
              <p>Hi ${student.name},</p>
              <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
              <div class="details">
                <p><strong>Username:</strong> ${student.userName}</p>
                <p><strong>Password:</strong> ${student.strongPassword}</p>
              </div>
              <p>Please make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.</p>
              <p class="footer">
                Best regards,<br>
                Skillontime Support Team<br>
                <a href="mailto:support@skillontime.com">support@skillontime.com</a>
              </p>
            </div>
          </body>
          </html>
        `,
      };

      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Message sent:', info.messageId);
        }
      });
    }

    // Update or create course purchased record
    await StudentCoursePurchased.update(
      { studentId: student.id, isPaymentDone : 'true' },
      { where: { order_id: order_id } }
    );

    // Handle referral if provided
    if (referbyId) {
      const referrer = await Student.findOne({ where: { studentId: referbyId } });

      if (referrer) {
        const referAmount = process.env.REFER_WALLET_AMOUNT;
        await student.update({ wallet: referAmount });
      } else {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Update batch details
    const updateBatch = await BatchModelTable.update(
      { remainingStudent: sequelize.literal('remainingStudent - 1') },
      { where: { courseId } }
    );

    if (!updateBatch) {
      return res.status(500).json({ message: 'Failed to update batch details' });
    }

    // Associate student with course and batch
    const batch = await BatchModelTable.findOne({ where: { courseId } });

    if (batch) {
      await StudentCourseTable.create({ studentId: student.id, courseId });
      await StudentBatch.create({ studentId: student.id, batchId: batch.id, courseId });
    }

    return res.status(200).json({
      message: 'Payment verified and student details updated successfully',
      data: student,
      response: response.data,
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// export const verifyPayment = async (req:Request, res: Response) => {
//      try{
//       const { order_id } = req.params;
//       const response = await Cashfree.PGOrderFetchPayments('2022-09-01', order_id);
//       if (response && response.data) {
//         console.log('Payment verified successfully:', response.data);
//         return res.send({
//           message: 'Payment verified fetched successfully',
//           data: response.data
//         });
//       } else {
//         console.error('Response or response data is undefined');
//         return res.status(404).send({
//           message: 'Order not found',
//           data: null
//         });
//       }
//      }catch(err){
//        return res.send({message : 'internal server error'})
//      }
// }


// export const verifyPayment = async (req: Request, res: Response) => {
//   try {
//     const { courseId, name,mobile, email,referbyId} = req.body;
//     const { order_id } = req.params;


//     if (Object.keys(req.body).length === 0) {
//       return res.status(400).json({ message: 'Send at least one key' });
//     }
  
//     // Fetch payment details from Cashfree
//     const response = await Cashfree.PGOrderFetchPayments('2022-09-01', order_id);
   
//     // if (response.data?.length === 0) {
//     //   console.error('Response or response data is undefined');
//     //   return res.status(404).send({
//     //     message: 'Order not found',
//     //   });
//     // }

//     // const paymentStatus = response.data[0].payment_status;
//     // if(paymentStatus != "SUCCESS"){
//     //    return res.status(500).send({message : 'failed'})
//     // }


//     // Ensure response.data exists and is an array with at least one item
// if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
//   console.error('Response data is undefined or empty');
//   return res.status(404).send({
//       message: 'Order not found',
//   });
// }

// // Ensure the first item in the array has the payment_status property
// const paymentStatus = response.data[0]?.payment_status;
// if (paymentStatus !== "SUCCESS") {
//   return res.status(500).send({ message: 'Payment failed', });
// }

// // Continue processing if paymentStatus is "SUCCESS"

//     // Find the student by orderId
//     const student1 = await Student.findOne({ where: { contactNumber : mobile , emailAddress : email } });
//     if (!student1) {
//       // return res.status(404).json({ message: 'Student not found' });
//       console.log('Processing payment for course:', courseId);
//       console.log('getting data from frontend:', req.body.name, req.body.mobile, req.body.email);
//       const order_amount = 1;
//       // Generate a strong password and hash it
//       const data1 = { contactnumber: req.body.mobile, emailaddress: req.body.email };
//       const strongPassword = generateStrongPassword(data1);
//       const hashedPassword = await bcrypt.hash(strongPassword, 10);
      
//       // Generate student ID
//       const randomNumber = Math.floor(10000 + Math.random() * 90000);
//       const namePart = req.body.email.slice(0, 4);
//       const studentId = namePart + randomNumber;
  
//       // Create student entry in the database
//       const student = await Student.create({
//         studentId,
//         studentName: namePart,
//         name: req.body.name,
//         userName: namePart,
//         contactNumber: req.body.mobile,
//         emailAddress: req.body.email,
//         password: hashedPassword,
//         strongPassword :strongPassword,
//         isPaymentDone: true,
//         order_id: null,
//         order_amount: order_amount,
//       });

//        // Check if courses with provided IDs exist
//     const courses = await CourseTable.findOne({
//       where: { id: courseId,
//       },
//     });

//     // Handle referral ID
//     if (referbyId) {
//       const referrer = await Student.findOne({
//         where: { studentId: referbyId },
//       });

//       if (referrer) {
//         const referAmount = process.env.REFER_WALLET_AMOUNT;
//         await student.update({ wallet: referAmount });
//       } else {
//         return res.status(400).json({ message: 'Invalid referral code' });
//       }
//     }

//     // Update batch details and check if the update was successful
//     const updateBatch = await BatchModelTable.update(
//       { remainingStudent: sequelize.literal('remainingStudent - 1') },
//       { where: { courseId: courseId } }
//     );

//     if (!updateBatch) {
//       return res.status(500).json({ message: 'Failed to update batch details' });
//     }

//     // Fetch the batches associated with the courses
//     const batches = await BatchModelTable.findOne({
//       where: { courseId: courseId },
//     });

//     if (!batches) {
//       return res.status(404).json({ message: 'No batches found for the given courses' });
//     }


//     const batch = await BatchModelTable.findOne({
//       where: { courseId: courseId },
//     });

//     if (batch) {
//       // Associate student with the course
//       await StudentCourseTable.create({ studentId: student.id, courseId: courseId });

//       // Associate student with the batch
//       await StudentBatch.create({
//         studentId: student.id,
//         batchId: batch.id,
//         courseId: courseId,
//       });
//     } 
//     }
     

//     //add student id into course purchsaed taable
//     const updateCoursePurchaed  = await StudentCoursePurchased.update(
//    { {studentId : student1.id,}
//       where {orderId : order_id}})
     
//     // Mark payment as done
    
//     // await finalResult.update({ isPaymentDone: true });

//     // Check if the body is empty
  

   

//     // Send welcome email
//     const mailOptions = {
//       from: process.env.USER_NAME,
//       to: student1.emailAddress,
//       subject: 'Welcome to Skillontime! Your Account Details',
//       text: `Hi ${student1.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${student1.userName}\nPassword: ${student1.password}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
//       html: `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <style>
//             body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; }
//             .container { width: 80%; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
//             h1 { color: #007BFF; }
//             .details { font-size: 16px; margin: 20px 0; }
//             .footer { margin-top: 20px; font-size: 14px; color: #666; }
//             .logo { width: 150px; height: auto; }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <img src="https://skillontime.com/wp-content/uploads/2024/08/SOT001-300x200.png" alt="Company Logo" class="logo">
//             <h1>Welcome to Skillontime!</h1>
//             <p>Hi ${student1.name},</p>
//             <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
//             <div class="details">
//               <p><strong>Username:</strong> ${student1.userName}</p>
//               <p><strong>Password:</strong> ${student1.strongPassword}</p>
//             </div>
//             <p>Please make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.</p>
//             <p class="footer">
//               Best regards,<br>
//               Skillontime Support Team<br>
//               <a href="mailto:support@skillontime.com">support@skillontime.com</a>
//             </p>
//           </div>
//         </body>
//         </html>
//       `,
//     };

//     transporter.sendMail(mailOptions, (error : any, info : any) => {
//       if (error) {
//         console.error('Error sending email:', error);
//       } else {
//         console.log('Message sent:', info.messageId);
//       }
//     });

//     await student1.update({ strongPassword: 'true' });

//     return res.status(200).json({
//       message: 'Payment verified and student details updated successfully',
//       data: student1,
//       response :response.data
//     });
//   } catch (error) {
//     console.error('Internal server error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
