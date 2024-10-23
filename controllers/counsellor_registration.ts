import { Request, Response } from 'express';
import Counsellor_registration from '../models/counsellor_registration';
import { transporter } from '../middleware/nodeMailer';
import { generateStrongPassword } from './userController';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";


import { decryptData } from '../middleware/encryption';



import { createUser, findAllUsers } from "../services/userService";
import { json, Sequelize, ValidationError, where } from "sequelize";

import { Otp, Student } from "../models/userModel";
import {StudentCourseTable} from '../models/studentCourseModel';
import {CourseTable} from '../models/courseModel';
import {BatchModelTable} from '../models/batchModelTable';
import {StudentBatch} from '../models/studentBatch';
import {StudentCoursePurchased} from '../models/studentCoursePurchased';


import multer from 'multer';
import path, { parse } from 'path';
import fs, { rmSync } from 'fs';




import crypto from 'crypto';

import { Cashfree } from 'cashfree-pg';
import { Op } from "sequelize";
import sequelize from "sequelize";
import axios from 'axios';

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



// Create a new counselor
export const createCounselor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, contactNumber, email, address,password } = req.body;

    console.log('this is console',req.body)

    // Check if a counselor with the same contact number or email already exists
    const existingCounselor = await Counsellor_registration.findOne({
      where: { contactNumber },
    });

    if (existingCounselor) {
       res.status(409).json({
        message: 'Counselor with this contact number already exists.',
      });
      return
    }

    const existingEmail = await Counsellor_registration.findOne({
      where: { email },
    });

    if (existingEmail) {
      res.status(409).json({
        message: 'Counselor with this email already exists.',
      });
      return
    }

    // Generate a strong password
    const data = { contactnumber: contactNumber, emailaddress: email };
    // const strongPassword = generateStrongPassword(data);
    const strongPassword = password;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new counselor
    const newCounselor = await Counsellor_registration.create({
      fullName,
      contactNumber,
      email,
      address,
      password: hashedPassword, // Save the hashed password
    });

    // Prepare email options
    const mailOptions = {
      from: process.env.USER_NAME,
      to: newCounselor.email,
      subject: 'Welcome to Skillontime! Your Account Details',
      text: `Hi ${newCounselor.fullName},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${newCounselor.fullName}\nPassword: ${strongPassword}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
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
            <p>Hi ${newCounselor.fullName},</p>
            <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
            <div class="details">
              <p><strong>Username:</strong> ${newCounselor.fullName}</p>
              <p><strong>Password:</strong> ${password}</p>
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

    // Send the email
    transporter.sendMail(mailOptions, (error:any, info:any) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Message sent:', info.messageId);
      }
    });

    res.status(201).json({
      message: 'Counselor created successfully',
      counselor: newCounselor,
      password : password,
    });
    console.log(res);
  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to create counselor',
      error: error.message,
    });
  }
};


// Update an existing counselor
export const updateCounselor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, contactNumber, email, address } = req.body;

    const counselor = await Counsellor_registration.findByPk(id);

    if (!counselor) {
      res.status(404).json({
        message: 'Counselor not found',
      });
      return;
    }

    counselor.fullName = fullName;
    counselor.contactNumber = contactNumber;
    counselor.email = email;
    counselor.address = address;

    await counselor.save();

    res.status(200).json({
      message: 'Counselor updated successfully',
      counselor,
    });
  } catch (error:any) {
    res.status(500).json({
      message: 'Failed to update counselor',
      error: error.message,
    });
  }
};

// Delete a counselor
export const deleteCounselor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const counselor = await Counsellor_registration.findByPk(id);

    if (!counselor) {
      res.status(404).json({
        message: 'Counselor not found',
      });
      return;
    }

    await counselor.destroy();

    res.status(200).json({
      message: 'Counselor deleted successfully',
    });
  } catch (error:any) {
    res.status(500).json({
      message: 'Failed to delete counselor',
      error: error.message,
    });
  }
};

export const get_all_counsellor = async (req: Request, res: Response): Promise<void> => {
    try {
      const counsellors = await Counsellor_registration.findAll();
      res.status(200).json({ counsellors });
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to get all counselors',
        error: error.message,
      });
    }
  };

  export const get_counselLor_by_id = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const counselor = await Counsellor_registration.findByPk(id);
      if (!counselor) {
        res.status(404).json({ message: 'Counselor not found' });
        return;
      }
      res.status(200).json({ counselor });
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to get counselor by ID',
        error: error.message,
      });
    }
  }


  export const CounsellorLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      console.log('counser login')

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }
  
      // Find the counselor by email
      const counselor = await Counsellor_registration.findOne({ where: { email } });
      if (!counselor) {
        res.status(404).json({ message: 'Counselor not found you are hitting login api' });
        return;
      }
      console.log('counselor',counselor);
  
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, counselor.password);
      
      console.log('is paword vlaid',isPasswordValid)
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid password' });
        return;
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: counselor.id, email: email },
        `${process.env.SECRET_KEY}`,
      );
  
      const counselorUpdate = await Counsellor_registration.update({token },{ where: { email } });
      if (!counselor) {
        res.status(404).json({ message: 'Counselor not found' });
        return;
      }

      // Send the token in the response
      res.status(200).json({ message : 'success' ,token : token});
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to login counselor',
        error: error,
        
      });
    }
  };

  export const CounsellorGet = async (req: Request, res: Response) => {
    try {
       let id = req.body.userId;
      const counselor = await Counsellor_registration.findOne({ where: { id : id } });
      if (!counselor) {
        res.status(404).json({ message: 'id not found  not found',counselor,id });
        return;
      }
      // Send the token in the response
      res.status(200).json({ status : true , message : 'user details fetched successfully' ,data : counselor});
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to login counselor',
        error: error,
        
      });
    }
  };


  export const CounsellorLogout = async (req: Request, res: Response) => {
    try {
      const token = req.headers["authorization"];
       console.log('token',token)
      // Find the counselor by email
      const counselor = await Counsellor_registration.findOne({ where: { token : token } });
      if (!counselor) {
        res.status(404).json({ message: 'Counselor not found',counselor,token });
        return;
      }
  
      const counselorUpdate = await Counsellor_registration.update({token : null},{ where: { token } });
      if (!counselor) {
        res.status(404).json({ message: 'Counselor not found' });
        return;
      }

      // Send the token in the response
      res.status(200).json({ message : 'logout successfully' ,token : counselorUpdate});
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to login counselor',
        error: error,
        
      });
    }
  };

  // export const CounsellorPayment = async (req: Request, res: Response) => {
  //   try {
  // return res.status(200).json({ message : 'success' ,token : "token"});
  //   } catch (error: any) {
  //     res.status(500).json({
  //       message: 'Failed to login counselor',
  //       error: error,
        
  //     });
  //   }
  // };


  export const CounsellorCourseList = async (req: Request, res: Response) => {
    try {
      let data = await CourseTable.findAll();
  return res.status(200).json({ message : 'success' ,data : data});
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to login counselor',
        error: error,
        
      });
    }
  };



  //store qr iamge here 
  // Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/qrCodeImages'); // Directory where profile pictures will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage: storage }).single('qrCodeImage'); // Handling a single file upload


const algorithm = 'aes-256-cbc'; // Encryption algorithm
const secretKey = 'e5c3f5bc0d1e2f3a4b'; // Ensure this is 32 bytes for AES-256
const iv = crypto.randomBytes(16); // Initialization vector for AES

// Ensure the key is 32 bytes
const key = crypto.createHash('sha256').update(secretKey).digest('base64').substr(0, 32);

function encrypt(data: any): string {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Include the IV with the encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData: string): any {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}



// id with paymennt amount encryption link

export const Encrypt = async (req: Request, res: Response) => {
  try {
    // Destructure the amount from the request body
    const { amount, courseId } = req.body;

    // Validate the presence of amount and courseId
    if (amount === undefined || courseId === undefined) {
      return res.status(400).send({ message: 'Send amount and courseId' });
    }
    // Prepare the data to be encrypted
    const data = { amount, courseId };
    const encrypted = encrypt(data); // Assume encrypt is a function that encrypts data

    // Respond with the encrypted data
    res.json({ encrypted });
  } catch (err: any) {
    // Handle any errors that occur during encryption
    res.status(500).send({ message: 'Error', error: err.message });
  }
};


//payment with image qr code encryption code

// export const Encrypt = async (req: Request, res: Response) => {

//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(500).send({ message: 'Error uploading file', error: err.message });
//     }
  
//   try {
//     const { courseId } = req.body;

//     if (!courseId || !req.file) {
//       return res.status(400).send({ message: 'Send courseId and QR code image' });
//     }

//     let image = `/uploads/qrCodeImages/${req.file.filename}`
//     const data = { image, courseId };
//     const encrypted = encrypt(data);

//     res.json({ encrypted });
//   }
//    catch (err :any) {
//     res.status(500).send({ message: 'Error', error: err.message });
//   }
// })
// };

export const Decrypt = async (req: Request, res: Response) => {
  try {
    const { encryptedData } = req.query;

    if (typeof encryptedData !== 'string') {
      return res.status(400).send({ message: 'Invalid encrypted data' });
    }

    const decryptedData = decrypt(encryptedData);
    const { courseId, amount } = decryptedData;

    res.json({ courseId, amount });
  } catch (error :any) {
    res.status(500).send({ message: 'Error', error: error.message });
  }
};



//api pay for phone pay amount pay

// // Base URL and API endpoint
// const BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
// const SALT_KEY = 'b7dbb332-a97f-4dfc-b6eb-64d397216248';  // Sample Salt Key
// const SALT_INDEX = 1;

// // Function to calculate X-VERIFY header
// const calculateXVerify = (payload : any) => {
//   const payloadBase64 = JSON.stringify(payload)
//   const payloadMain = Buffer.from(payloadBase64).toString('base64')
//   const keyindex = 1; 
//   const string = payloadMain + '/pg/v1/pay' + SALT_KEY;
//   const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//   const checksum = sha256 + '###' + keyindex; 

//   return `${checksum}`;
// };

// export const phonePay = async (req: Request, res: Response) => {
//   const payload = req.body;
//   console.log('Payload in backend:', payload);

//   try {
//     // Calculate X-VERIFY header value
//     const xVerifyHeader = calculateXVerify(payload);

//     console.log('base 64',  Buffer.from(JSON.stringify(payload)).toString('base64'))

//     const options = {
//       method: 'post',
//       url: 'https://api.phonepe.com/apis/hermes',
//       headers: {
//         'Content-Type': 'application/json',
//         // 'X-VERIFY': xVerifyHeader,
//         // 'Accept': 'application/json',
//         accept: 'text/plain',
//       },
//       data: {
//         request: Buffer.from(JSON.stringify(payload)).toString('base64')
//       }
//     };

//     // Make the request
//     const response = await axios.request(options);
//     console.log('Response data:', response.data);

//     // Handle redirection if needed
//     if (response.data.success) {
//       console.log('Redirect URL:', response);
//     }

//     // Send response back to the client
//     res.json(response.data);
//   } catch (error: any) {
//     console.error('Error in PhonePe API:', error.message);

//     // Return error response
//     res.status(500).send({
//       status: false,
//       message: 'Internal Server Error',
//       error: error.message || 'Unknown error'
//     });
//   }
// };





// Base URL and API endpoint
const BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'; // Use the correct environment
const API_KEY = 'b7dbb332-a97f-4dfc-b6eb-64d397216248'; // Replace with your actual API key
const SALT_INDEX = 1;

// Function to calculate X-VERIFY header
const calculateXVerify = (payload: any) => {
  // Convert payload to base64
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  // Construct the string for hashing
  const stringToHash = `${payloadBase64}/pg/v1/pay${API_KEY}`;
  // Generate SHA256 hash
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  // Create checksum with salt index
  const checksum = `${sha256}###${SALT_INDEX}`;
  return checksum;
};

export const phonePay = async (req: Request, res: Response) => {
  const payload = req.body;
  console.log('Payload in backend:', payload);

  try {
    // Calculate X-VERIFY header value
    const xVerifyHeader = calculateXVerify(payload);

    const options = {
      method: 'post',
      url: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        // 'X-VERIFY': xVerifyHeader,
        'Accept': 'application/json',
      },
      data: {
        request: Buffer.from(JSON.stringify(payload)).toString('base64')
      }
    };

    // Make the request
    const response = await axios.request(options);
    console.log('Response data:', response.data);

    // Handle redirection if needed
    if (response.data.success) {
      console.log('Redirect URL:', response.data.data.instrumentResponse.redirectInfo.url);
    }

    // Send response back to the client
    res.json(response.data);
  } catch (error: any) {
    console.error('Error in PhonePe API:', error.message);

    // Return error response
    res.status(500).send({
      status: false,
      message: 'Internal Server Error',
      error: error.message || 'Unknown error'
    });
  }
};





export const newPayment = async (req :Request , res : Response) => {
  try {

    const BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'; // Use the correct environment
const merchant_id = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'; // Replace with your actual API key
const salt_key = 1;

      const merchantTransactionId = req.body.transactionId;
      const data = {
          merchantId: merchant_id,
          merchantTransactionId: merchantTransactionId,
          merchantUserId: req.body.MUID,
          name: req.body.name,
          amount: req.body.amount * 100,
          redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
          redirectMode: 'POST',
          mobileNumber: req.body.number,
          paymentInstrument: {
              type: 'PAY_PAGE'
          }
      };
      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const keyIndex = 1;
      const string = payloadMain + '/pg/v1/pay' + salt_key;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;

      const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
      const options = {
          method: 'POST',
          url: prod_URL,
          headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              'X-VERIFY': checksum
          },
          data: {
              request: payloadMain
          }
      };

      axios.request(options).then(function (response) {
          console.log(response.data)
          return res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
      })
      .catch(function (error) {
          console.error(error);
      });

  } catch (error) {
      res.status(500).send({
          message : 'internal server error',
          error: error,
          success: false
      })
  }
}

  // export const CounsellorPurchaseCourse = async (req: Request, res: Response) => {
  //   try {
  //     const { encryptedData } = req.query;    
  //     if (!encryptedData) {
  //       return res.status(400).json({ error: 'No data provided' });
  //     }
  //     // const secretKey = 'e5c3f5b6e7d8a6c1b2a9e3d4f5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b';
  //     const decryptedData = decrypt(encryptedData, 'e5c3f5bc0d1e2f3a4b');
  //     const parsedData = JSON.parse(decryptedData);
  //     const {courseId, amount } = parsedData;

  //     // const  courseId  = decryptedId;
  //     // const price = decryptedRupees;
  //     const order_amount = amount ;
  //     // Request object for Cashfree
  //     const request = {
  //       order_amount: Number(order_amount),
  //       order_currency: 'INR',
  //       order_id: GeneratedOrderId(),
  //       customer_details: {
  //         customer_id: courseId,
  //         customer_phone: req.body.mobile,
  //         customer_name: req.body.name,
  //         customer_email: req.body.email
  //       },
  //       order_meta: {
  //         return_url: 'https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}'
  //       }
  //     };
  
  //     // Create order with Cashfree
  //     const response = await Cashfree.PGCreateOrder('2022-09-01', request);
  
  //jasdflkdsj;af

  //     // Extract relevant data
  //     const { data } = response;
  
  //     // Store order details in the student record
  
  //      // Create student entry in the database
  //      const finalResult = await StudentCoursePurchased.create({
  //       order_id : data?.order_id,
  //       order_amount : data?.order_amount,
  //       mobile : req.body.mobile,
  //       course_id : courseId,
  //       isPaymentDone : false
  //     });
  
  //     // Send response with relevant details
  //     res.send({
  //       message: 'Order created successfully',
  //       data: {
  //         order_id: data?.order_id,
  //         order_amount: data?.order_amount,
  //         order_currency: data?.order_currency,
  //         return_url: data?.order_meta?.return_url,
  //         payment_session_id: data?.payment_session_id
  //       }
  //     });
  
  //   }
    
  //   // catch (error) {
  
  //   catch (error) {
  //     // if (error instanceof ValidationError) {
  //     //   return res.status(400).json({
  //     //     message: "Validation error",
  //     //     errors: error.errors.map((err) => ({
  //     //       field: err.path,
  //     //       message: err.message,
  //     //     })),
  //     //   });
  //     // }
  //     console.error('Internal server error:', error);
  //     return res.status(500).json({ message: "Internal server error" });
  //   }
  // };
  

  
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
