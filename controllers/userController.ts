import { Request, Response } from "express";
import { createUser, findAllUsers } from "../services/userService";
import { col, fn, Sequelize, ValidationError, where } from "sequelize";

import bcrypt from "bcrypt"; // Assuming you're using bcrypt for password hashing
import jwt from "jsonwebtoken"; // For generating JWT tokens
import { Otp, Student } from "../models/userModel";
import { StudentCourseTable } from '../models/studentCourseModel';
import { CourseTable } from '../models/courseModel';
import { BatchModelTable } from '../models/batchModelTable';
import { StudentBatch } from '../models/studentBatch';


import multer from 'multer';
import path from 'path';
import fs, { rmSync } from 'fs';

import { transporter } from '../middleware/nodeMailer';
import { Op } from "sequelize";
import sequelize from "sequelize";


export function generateStrongPassword(data: {
  contactnumber: string;
  emailaddress: string;
}): string {
  // Extract the values
  const { contactnumber, emailaddress } = data;

  // Create a base string by mixing the contact number and email address, excluding dots
  let baseString = (contactnumber + emailaddress).replace(/\./g, "");

  // Define a function to shuffle the characters in a string
  const shuffleString = (str: string): string => {
    return str
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  // Apply transformations 10 times
  for (let i = 0; i < 10; i++) {
    baseString = shuffleString(baseString);
  }

  // Extract a 10-character substring for the password
  // Ensuring the password length is at least 10 characters
  const passwordLength = Math.min(10, baseString.length);
  const password = baseString.substring(0, passwordLength);

  return password;
}


export const BatchCreate = async (req: Request, res: Response) => {
  const create = await BatchModelTable.create(req.body);
  return res.send({ message: 'batch created ', data: create })
}


// export const create = async (req: Request, res: Response) => {
//   try {
//     const courseIds = req.body.courseId;
//     //console.log("req body", req.body);
//     //check if addahr number is present thencheck validations

//     if (Object.keys(req.body).length === 0) {
//       return res.status(400).send({ message: "Send at least one key" });
//     }

//     //check course table has data or not
//     if (!Array.isArray(courseIds) || courseIds.length === 0) {
//       return res.status(400).json({ message: "courseIds should be a non-empty array" });
//     }

//     // Find courses with the given IDs
//     const courses = await CourseTable.findAll({
//       where: {
//         id: {
//           [Op.in]: courseIds,
//         },
//       },
//     });

//     // Check if all IDs exist
//     if (courses.length !== courseIds.length) {
//       return res.status(404).json({ message: "Some course IDs do not exist",  });
//     }

//     //generating passwoerd
//     // Example usage
//     const data = {
//       contactnumber: req.body.contactNumber,
//       emailaddress: req.body.emailAddress,
//     };

//     const strongPassword = generateStrongPassword(data);
//     console.log("Generated Strong Password:", strongPassword);

//     //storing auto created password in req object
//     const hashedPassword = await bcrypt.hash(strongPassword, 10);
//     req.body.password = hashedPassword;

//     const randomNumber = Math.floor(10000 + Math.random() * 90000);
//     const namePart = req.body.emailAddress.slice(0, 4);
//     const studentId = namePart + randomNumber;

//     //student id
//     req.body.studentId = studentId;
//     const emailMatch = req.body.emailAddress.match(/^([^@]+)@/);
//     if (!emailMatch) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }
//     //console.log('email match',emailMatch)
//     const emailPart = emailMatch[1];
//     //student name
//     req.body.studentName = emailPart;

//     //user name
//     req.body.userName = emailPart;

//     // check if mobile no is alredy registered and email both
//     let isRegistered = await Student.findOne({
//       where: {
//         [Op.or]: [
//           { contactNumber: req.body.contactNumber },
//           { emailAddress: req.body.emailAddress }
//         ],
//         isDeleted: false,
//       },
//     });

//     if (isRegistered) {
//       return res.status(409).json({ message: "Contact number or email address already exists" });
//     }
//     //refer by id
//     if (req.body.referbyId) {
//       let result = await Student.findOne({
//         where: { studentId: req.body.referbyId },
//       });
//       //console.log('checking refer id in database',result);
//       if (result) {
//         const referAmount = `${process.env.REFER_WALLET_AMOUNT}` // Replace with your secret key
//         req.body.wallet = referAmount
//       } else {
//         // return res.status(400).send({ message: "Invalid referal code" });
//       }
//     } else {
//       req.body.referbyId = "null";
//     }

//     //here store batch details

//     const batch = await BatchModelTable.update(
//       { 
//         remainingStudent: sequelize.literal('remainingStudent - 1')
//       },
//       {
//         where: { 
//           courseId: {
//             [Op.in]: courseIds
//           }
//         }
//       }
//     );

//     //get all batches using this id 
//     const batches = await BatchModelTable.findAll({
//       where: {
//         courseId: {
//           [Op.in]: courseIds
//         }
//       },
//     });

//     // console.log('batches',batches)

//     const finalresult = await createUser(req.body);
//     finalresult.password  =strongPassword;

//     //sotre user id and course id in this table 
//     let courseId = req.body.courseId; 

//     for(let i = 0 ; i <courseId.length; i++){
//       let finalData = {
//         studentId : finalresult.id,
//         courseId : courseId[i]
//      }
//      await StudentCourseTable.create(finalData);
//      await StudentBatch.create({
//       studentId : finalresult.id,
//       batchId : batches[i].id,
//       courseId :  courseId[i],
//   });
//     }

//     //create student batch table here 


//     const mailOptions = {
//       from: process.env.USER_NAME,
//       to: finalresult.emailAddress, // List of receivers
//       subject: 'Welcome to Skillontime! Your Account Details',
//       text: `Hi ${finalresult.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${finalresult.userName}\nPassword: ${finalresult.password}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
//       html: `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     color: #333;
//                     margin: 0;
//                     padding: 0;
//                     background-color: #f9f9f9;
//                 }
//                 .container {
//                     width: 80%;
//                     margin: 0 auto;
//                     background-color: #fff;
//                     padding: 20px;
//                     border-radius: 8px;
//                     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                 }
//                 h1 {
//                     color: #007BFF;
//                 }
//                 .details {
//                     font-size: 16px;
//                     margin: 20px 0;
//                 }
//                 .footer {
//                     margin-top: 20px;
//                     font-size: 14px;
//                     color: #666;
//                 }
//                 .logo {
//                     width: 150px;
//                     height: auto;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <img src="https://skillontime.com/wp-content/uploads/2024/08/SOT001-300x200.png" alt="Company Logo" class="logo">
//                 <h1>Welcome to Skillontime!</h1>
//                 <p>Hi ${finalresult.name},</p>
//                 <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
//                 <div class="details">
//                     <p><strong>Username:</strong> ${finalresult.userName}</p>
//                     <p><strong>Password:</strong> ${finalresult.password}</p>
//                 </div>
//                 <p>Please make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.</p>
//                 <p class="footer">
//                     Best regards,<br>
//                     Skillontime Support Team<br>
//                     <a href="mailto:support@skillontime.com">support@skillontime.com</a>
//                 </p>
//             </div>
//         </body>
//         </html>
//       `,
//     };



// transporter.sendMail(mailOptions, (error : any , info : any) => {
//   console.log('error and info ',error,info)
//   if (error) {
//     // return console.log('Error:', error);
//   }
//   console.log('Message sent: %s', info.messageId);
// });



//     res.status(201).json({ data: finalresult });
//   } catch (error) {
//     //console.log("error", error);
//     if (error instanceof ValidationError) {
//       res.status(400).json({
//         message: "Validation error",
//         errors: error.errors.map((err) => ({
//           field: err.path,
//           message: err.message,
//         })),
//       });
//     } else {
//       res.status(500).json({ data: error, message: "Internal server error" });
//     }
//   }
// };





//  export const create = async (req: Request, res: Response) => {
//   try {
//     const { courseId: courseIds, contactNumber, emailAddress, referbyId } = req.body;

//     // Validate input data
//     if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
//       return res.status(400).json({ message: "courseIds should be a non-empty array" });
//     }

//     if (!contactNumber || typeof contactNumber !== "string") {
//       return res.status(400).json({ message: "Invalid or missing contactNumber" });
//     }

//     // if (!courseName || typeof courseName !== "string") {
//     //   return res.status(400).json({ message: "Invalid or missing course name" });
//     // }

//     if (!emailAddress || !emailAddress.match(/^([^@]+)@/)) {
//       return res.status(400).json({ message: "Invalid or missing emailAddress" });
//     }

//     // Check if the body is empty
//     if (Object.keys(req.body).length === 0) {
//       return res.status(400).json({ message: "Send at least one key" });
//     }

//     // Check if courses with provided IDs exist
//     const courses = await CourseTable.findAll({
//       where: {
//         id: {
//           [Op.in]: courseIds,
//         },
//       },
//     });

//     if (courses.length !== courseIds.length) {
//       return res.status(404).json({ message: "Some course IDs do not exist" });
//     }

//     // Generate strong password
//     const data = { contactnumber: contactNumber, emailaddress: emailAddress };
//     const strongPassword = generateStrongPassword(data);
//     console.log('strong password',strongPassword)
//     const hashedPassword = await bcrypt.hash(strongPassword, 10);
//     req.body.password = hashedPassword;
//     // Generate student ID
//     const randomNumber = Math.floor(10000 + Math.random() * 90000);
//     const namePart = emailAddress.slice(0, 4);
//     const studentId = namePart + randomNumber;
//     req.body.studentId = studentId;

//     // Extract and set student name and username
//     const emailPart = emailAddress.match(/^([^@]+)@/)[1];
//     req.body.studentName = emailPart;
//     req.body.userName = emailPart;

//     // Check if contact number or email is already registered
//     const isRegistered = await Student.findOne({
//       where: {
//         [Op.or]: [
//           { contactNumber },
//           { emailAddress }
//         ],
//         isDeleted: false,
//       },
//     });

//     if (isRegistered) {
//       return res.status(409).json({ message: "Contact number or email address already exists" });
//     }

//     // Handle referral ID
//     if (referbyId) {
//       const referrer = await Student.findOne({
//         where: { studentId: referbyId },
//       });

//       if (referrer) {
//         const referAmount = process.env.REFER_WALLET_AMOUNT;
//         req.body.wallet = referAmount;
//       } else {
//         return res.status(400).json({ message: "Invalid referral code" });
//       }
//     } else {
//       req.body.referbyId = "null";
//     }

//     // Update batch details and check if the update was successful
//     const updateBatch = await BatchModelTable.update(
//       { remainingStudent: sequelize.literal('remainingStudent - 1') },
//       { where: { courseId: { [Op.in]: courseIds } } }
//     );

//     if (!updateBatch) {
//       return res.status(500).json({ message: "Failed to update batch details" });
//     }

//     // Fetch the batches associated with the courses
//     const batches = await BatchModelTable.findAll({
//       where: { courseId: { [Op.in]: courseIds } },
//     });

//     if (batches.length === 0) {
//       return res.status(404).json({ message: "No batches found for the given courses" });
//     }

//     // Create the user
//     const finalResult = await createUser(req.body);
//     finalResult.password = strongPassword;

//     // Associate student with courses and batches
//     await Promise.all(
//       courseIds.map(async (id, index) => {
//         await StudentCourseTable.create({ studentId: finalResult.id, courseId: id });
//         await StudentBatch.create({
//           studentId: finalResult.id,
//           batchId: batches[index].id,
//           courseId: id,
//         });
//       })
//     );

//     // Send welcome email
//     const mailOptions = {
//       from: process.env.USER_NAME,
//       to: finalResult.emailAddress,
//       subject: 'Welcome to Skillontime! Your Account Details',
//       text: `Hi ${finalResult.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${finalResult.userName}\nPassword: ${finalResult.password}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
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
//             <p>Hi ${finalResult.studentName},</p>
//             <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
//             <div class="details">
//               <p><strong>Username:</strong> ${finalResult.userName}</p>
//               <p><strong>Password:</strong> ${finalResult.password}</p>
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

//     transporter.sendMail(mailOptions, (error: any, info: any) => {
//       if (error) {
//         console.error('Error sending email:', error);
//       } else {
//         console.log('Message sent:', info.messageId);
//       }
//     });

//     return res.status(201).json({ data: finalResult });
//   } catch (error) {
//     if (error instanceof ValidationError) {
//       return res.status(400).json({
//         message: "Validation error",
//         errors: error.errors.map((err) => ({
//           field: err.path,
//           message: err.message,
//         })),
//       });
//     }
//     console.error('Internal server error:', error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const create = async (req: Request, res: Response) => {
  try {
    const { courseIds, order_id, order_amount, contactNumber, emailAddress, referbyId } = req.body;

    console.log("CourseIDs:", courseIds);
    console.log("Body Data:", req.body);

    if (!courseIds) {
      return res.status(400).json({ message: "courseIds should be present" });
    }

    if (!contactNumber) {
      return res.status(400).json({ message: "Invalid or missing contactNumber" });
    }

    if (!emailAddress || !emailAddress.match(/^([^@]+)@/)) {
      return res.status(400).json({ message: "Invalid or missing emailAddress" });
    }

    if (!order_id || typeof order_id !== "string") {
      return res.status(400).json({ message: "Invalid or missing Order-Id" });
    }

    if (!order_amount || typeof order_amount !== "number") {
      return res.status(400).json({ message: "Invalid or missing Order Amount" });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Send at least one key" });
    }

    // Check if courses with provided IDs exist and get full details
    const courses = await CourseTable.findAll({
      where: {
        id: courseIds,
        isDeleted: false,
      },
      attributes: ['id', 'name'], // Only select the necessary attributes
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // if(courses){

    // }

    // Concatenate course names into a single string
    const courseNames = courses.map(course => course.name).join(', ');
    const courseIdsFound = courses.map(course => course.id);
    req.body.courseName = courseNames;
    req.body.courseId = courseIdsFound;

    // Generate strong password
    const data = { contactnumber: contactNumber, emailaddress: emailAddress };
    const strongPassword = generateStrongPassword(data);
    const hashedPassword = await bcrypt.hash(strongPassword, 10);
    req.body.password = hashedPassword;
    req.body.strongPassword = strongPassword;

    // Generate student ID
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const namePart = emailAddress.slice(0, 4);
    const studentId = namePart + randomNumber;
    req.body.studentId = studentId;

    // Extract and set student name and username
    const emailPart = emailAddress.match(/^([^@]+)@/)[1];
    req.body.studentName = emailPart;
    req.body.userName = emailPart;

    // Check if contact number or email is already registered
    const isRegistered = await Student.findOne({
      where: {
        [Op.or]: [
          { contactNumber },
          { emailAddress }
        ],
        isDeleted: false,
      },
    });

    if (isRegistered) {
      return res.status(409).json({ message: "Contact number or email address already exists" });
    }

    // Handle referral ID
    if (referbyId) {
      const referrer = await Student.findOne({
        where: { studentId: referbyId, isDeleted: false },
      });

      if (referrer) {
        const referAmount = process.env.REFER_WALLET_AMOUNT;
        req.body.wallet = referAmount;
      } else {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    } else {
      req.body.referbyId = "null";
    }

    // Update batch details
    const updateBatch = await BatchModelTable.update(
      { remainingStudent: sequelize.literal('remainingStudent - 1') },
      { where: { courseId: courseIds, isDeleted: false } }
    );

    const batches = await BatchModelTable.findOne(
      { where: { courseId: courseIds, isDeleted: false } }
    );

    if (!batches) {
      return res.status(404).json({ message: "No batches found for the given courses" });
    }

    req.body.batchId = batches.id;

    if (!updateBatch) {
      return res.status(500).json({ message: "Failed to update batch details" });
    }




    req.body.isPaymentDone = true;

    // Create the user and include the course names
    const finalResult = await createUser(req.body, { isPaymentDone: true });
    finalResult.password = strongPassword;

    // Associate student with courses and batches
    // await Promise.all(
    //   courseIds.map(async (id, index) => {
    await StudentCourseTable.create({ studentId: finalResult.id, courseId: courseIds });
    await StudentBatch.create({
      studentId: finalResult.id,
      batchId: batches.id,
      courseId: courseIds,
    });
    //   })
    // );

    // Send welcome email
    const mailOptions = {
      from: process.env.USER_NAME,
      to: finalResult.emailAddress,
      subject: 'Welcome to Skillontime! Your Account Details',
      text: `Hi ${finalResult.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${finalResult.userName}\nPassword: ${finalResult.password}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
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
            <img src="https://skillontime.com/wp-content/uploads/2024/08/SOT001-300x200.png" alt="Company Logo" class="logo">
            <h1>Welcome to Skillontime!</h1>
            <p>Hi ${finalResult.studentName},</p>
            <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
            <div class="details">
              <p><strong>Username:</strong> ${finalResult.userName}</p>
              <p><strong>Password:</strong> ${finalResult.password}</p>
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

    // Include course details in the response
    return res.status(201).json({
      message: 'student created successfully',
      data: finalResult,
      courses: courses, // Include the full course details
    });
  } catch (error) {
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



export const createFreeSignup = async (req: Request, res: Response) => {
  try {
    const { courseIds, contactNumber, emailAddress, referbyId } = req.body;

    console.log("CourseIDs:", courseIds);
    console.log("Body Data:", req.body);

    if (!courseIds) {
      return res.status(400).json({ message: "courseIds should be present" });
    }

    if (!contactNumber) {
      return res.status(400).json({ message: "Invalid or missing contactNumber" });
    }

    if (!emailAddress || !emailAddress.match(/^([^@]+)@/)) {
      return res.status(400).json({ message: "Invalid or missing emailAddress" });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Send at least one key" });
    }

    // Check if courses with provided IDs exist and get full details
    const courses = await CourseTable.findAll({
      where: {
        id: courseIds,
        isDeleted: false,
      },
      attributes: ['id', 'name'], // Only select the necessary attributes
    });

    console.log("Courses:", courses);


    if (courses.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }


    // Concatenate course names into a single string
    const courseNames = courses.map(course => course.name).join(', ');
    const courseIdsFound = courses.map(course => course.id);
    req.body.courseName = courseNames;
    req.body.courseId = courseIdsFound;

    // Generate strong password
    const data = { contactnumber: contactNumber, emailaddress: emailAddress };
    const strongPassword = generateStrongPassword(data);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    req.body.strongPassword = strongPassword;

    // Generate student ID
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const namePart = emailAddress.slice(0, 4);
    const studentId = namePart + randomNumber;
    req.body.studentId = studentId;

    // Extract and set student name and username
    const emailPart = emailAddress.match(/^([^@]+)@/)[1];
    req.body.studentName = emailPart;
    req.body.userName = emailPart;

    // Check if contact number or email is already registered
    const isRegistered = await Student.findOne({
      where: {
        [Op.or]: [
          { contactNumber },
          { emailAddress }
        ],
        isDeleted: false,
      },
    });

    if (isRegistered) {
      return res.status(409).json({ message: "Contact number or email address already exists" });
    }

    // Handle referral ID
    if (referbyId) {
      const referrer = await Student.findOne({
        where: { studentId: referbyId, isDeleted: false },
      });

      if (referrer) {
        const referAmount = process.env.REFER_WALLET_AMOUNT;
        req.body.wallet = referAmount;
      } else {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    } else {
      req.body.referbyId = "null";
    }

    // Update batch details
    const updateBatch = await BatchModelTable.update(
      { remainingStudent: sequelize.literal('remainingStudent - 1') },
      { where: { courseId: courseIds, isDeleted: false } }
    );

    const batches = await BatchModelTable.findOne(
      { where: { courseId: courseIds, isDeleted: false } }
    );

    if (!batches) {
      return res.status(404).json({ message: "No batches found for the given courses" });
    }

    req.body.batchId = batches.id;

    if (!updateBatch) {
      return res.status(500).json({ message: "Failed to update batch details" });
    }




    // Create the user and include the course names
    const finalResult = await Student.create(req.body);
    finalResult.password = strongPassword;

    // Associate student with courses and batches
    // await Promise.all(
    //   courseIds.map(async (id, index) => {
    await StudentCourseTable.create({ studentId: finalResult.id, courseId: courseIds });
    await StudentBatch.create({
      studentId: finalResult.id,
      batchId: batches.id,
      courseId: courseIds,
    });
    //   })
    // );

    // Send welcome email
    const mailOptions = {
      from: process.env.USER_NAME,
      to: finalResult.emailAddress,
      subject: 'Welcome to Skillontime! Your Account Details',
      text: `Hi ${finalResult.name},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${finalResult.userName}\nPassword: ${finalResult.password}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
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
            <img src="https://skillontime.com/wp-content/uploads/2024/08/SOT001-300x200.png" alt="Company Logo" class="logo">
            <h1>Welcome to Skillontime!</h1>
            <p>Hi ${finalResult.studentName},</p>
            <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
            <div class="details">
              <p><strong>Username:</strong> ${finalResult.userName}</p>
              <p><strong>Password:</strong> ${finalResult.password}</p>
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

    // Include course details in the response
    return res.status(201).json({
      message: 'student created successfully',
      data: finalResult,
      courses: courses, // Include the full course details
    });
  } catch (error) {
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






export const GetAllCourseListForFreeRegistratioin = async (req: Request, res: Response) => {
  try {
    const data = await CourseTable.findAll({
      where: {
        isDeleted: false
      },
      attributes: ['name', 'id']
    });

    res
      .status(200)
      .json({
        data: { message: 'All course list ', data: data },
      });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};

export const get = async (req: Request, res: Response) => {
  const { id } = req.params
  console.log('id from params', id)
  const data = await Student.findOne({
    where: {
      id,
      isDeleted: false
    },
    attributes: { exclude: ['password', 'updatedAt', 'isDeleted', 'token', 'otp'] }
  });
  if (data) {
    return res.status(200).send({ data });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
};



export const getUsetByTokenId = async (req: Request, res: Response) => {
  const data = await Student.findOne({
    where: {
      id: req.body.userId,
      isDeleted: false
    },
    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'isDeleted', 'token', 'otp'] }
  });
  if (data) {
    return res.status(200).send({ data });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
};





export const findAll = async (req: Request, res: Response) => {
  try {
    const { search = '', page = 1, limit = 10, courseId } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageSize;

    // Build the query where clause
    const whereClause: any = {
      isDeleted: false,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { courseName: { [Op.like]: `%${search}%` } }
      ]
    };

    // If a courseId is provided, filter by course
    if (courseId) {
      whereClause.courseId = parseInt(courseId as string, 10);
    }

    // Fetch all students with search, course filter, and pagination
    const { count, rows: students } = await Student.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset,
      include: [
        // Include other models if necessary (e.g., CourseTable, BatchModelTable)
      ]
    });

    if (students.length === 0) {
      return res.status(404).json({ message: "No student data found" });
    }

    // Extract course names from students data
    const courseIds = students.map(student => student.courseId);

    // Fetch courses from the CourseTable
    const courses = await CourseTable.findAll({
      where: {
        id: {
          [Op.in]: courseIds
        }
      }
    });

    // Create a mapping of course ID to course name
    const courseMap = courses.reduce((acc, course) => {
      acc[course.id] = course.name;
      return acc;
    }, {} as Record<number, string>);

    // Fetch batches from BatchModelTable
    const batches = await BatchModelTable.findAll({
      where: {
        courseId: {
          [Op.in]: Object.keys(courseMap)
        }
      }
    });

    // Create a mapping of course ID to batch names
    const batchMap = batches.reduce((acc, batch) => {
      if (!acc[batch.courseId]) {
        acc[batch.courseId] = [];
      }
      acc[batch.courseId].push(batch.batchName);
      return acc;
    }, {} as Record<number, string[]>);

    // Attach course names and batch names to each student
    const studentsWithDetails = students.map(student => {
      const courseName = courseMap[student.courseId];
      const batchNames = (batchMap[student.courseId] || []).join(', '); // Join array elements into a single string

      return {
        ...student.dataValues, // Include only the relevant data
        courseName, // Add course name
        batchNames // Add batch names
      };
    });

    // Send paginated and search results
    return res.status(200).json({
      data: {
        totalStudents: studentsWithDetails.length,
        students: studentsWithDetails,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: "An error occurred while fetching students." });
  }
};




//update student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.body.userId; // Get student ID from URL parameters
    const updateData = req.body; // Get the fields to update from the request body
    if (updateData.name) {
      return res.status(400).send({ message: 'user can not update  name please contact to support team' })
    }
    //console.log('req body data ',req.body)
    // Ensure the ID is provided
    if (!id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Ensure updateData is not empty
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Update the student record
    const [updatedRowsCount] = await Student.update(updateData, {
      where: { id: id, isDeleted: false },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedStudent = await Student.findByPk(id, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });

    res.status(200).send({ message: "data updated", data: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the student" });
  }
};


//update student by admin
export const updateStudentByAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get student ID from URL parameters
    const updateData = req.body; // Get the fields to update from the request body
    // if (updateData.name) {
    //   return res.status(400).send({ message: 'user can not update  name please contact to support team' })
    // }
    //console.log('req body data ',req.body)
    // Ensure the ID is provided
    if (!id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Ensure updateData is not empty
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Update the student record
    const [updatedRowsCount] = await Student.update(updateData, {
      where: { id: id, isDeleted: false },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedStudent = await Student.findByPk(id, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });

    res.status(200).send({ message: "data updated", data: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the student" });
  }
};

export const DeleteFunction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ensure the ID is provided
    if (!id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Update the student record
    const [updatedRowsCount] = await Student.update(
      { isDeleted: true },
      {
        where: { id: id, isDeleted: false },
      }
    );
    console.log("U[pdated row count:", updatedRowsCount);

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).send({ message: "data updated" });
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the student" });
  }
};

// // Function to find a user by mobile number and validate password
// export const login = async (req: Request, res: Response) => {
//   try {

//     const { userName, password } = req.body;
//     // Validate input

//     console.log('assword',userName,password)

//     if (!userName || !password) {
//       return res
//         .status(400)
//         .json({ message: "userName and password are required" });
//     }
//     // Find the user by mobile number

//     let checkUserName = await Student.findOne({
//       where: { userName, isDeleted: false },
//     });

//     if (!checkUserName) {
//       return res
//         .status(401)
//         .json({ message: "Invalid userName  or password" });
//     }
//     console.log('Hashed password from DB:', checkUserName.password);

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, checkUserName.password);

//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ message: "Invalid  password", isMatch });
//     }

//     // Generate a token
//     const token = jwt.sign({ id: checkUserName.id }, `${process.env.SECRET_KEY}`, { expiresIn: '3d' });

//     await Student.update(
//       { token: token },
//       { where: { userName, isDeleted: false } }
//     );


//     const studentId = checkUserName.id;

//     // const courses = await CourseTable.findAll({
//     //   attributes: ['name'], // Select only the 'name' attribute from CourseTable
//     //   include: [
//     //     {
//     //       model: StudentCourseTable,
//     //       attributes: [], // Exclude attributes from StudentCourseTable
//     //       where: { studentId }, // Filter by studentId
//     //     },
//     //   ],
//     // });

//     // Extract course names and student data directly from the results
//     // let userData = await Student.findOne({
//     //   where: { userName, isDeleted: false },
//     //   attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'password', 'status', 'otp'] }
//     // });
//     // console.log(courses);

//     res
//       .status(200)
//       .json({
//         data: { courses :checkUserName, userData : checkUserName, token, id: checkUserName.id, mobileNo: checkUserName.contactNumber },
//       });
//   } catch (error) {
//     //console.log("error", error);
//     res.status(500).json({ message: "Internal server error", data: error });
//   }
// };


export const login = async (req: Request, res: Response) => {
  try {
    let { userName, password } = req.body;

    // Validate input
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "userName and password are required" });
    }


    let emailPart = ''
    // Check if userName contains '@', indicating it's an email address
    if (userName.includes('@')) {
      // Extract the part before '@'
      emailPart = userName.match(/^([^@]+)@/)[1];
      console.log('Local part of the email:', emailPart);
      // Use emailPart as needed, e.g., for database queries or validation
    } else {
      console.log('Username is not an email address:', userName);
      emailPart = userName;
      // Handle case where userName is not an email address
    }


    //check 
    userName = emailPart;
    // Find the user by userName
    const checkUserName = await Student.findOne({
      where: { userName, isDeleted: false },
    });

    if (!checkUserName) {
      return res
        .status(401)
        .json({ message: "Invalid userName or password" });
    }
    console.log('Hashed password from DB:', checkUserName.password);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, checkUserName.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid password", isMatch });
    }

    // Generate a token
    const token = jwt.sign({ id: checkUserName.id }, `${process.env.SECRET_KEY}`, { expiresIn: '3d' });

    // Update user token
    await Student.update(
      { token: token },
      { where: { userName, isDeleted: false } }
    );

    // Fetch courses using `findAll` with proper join
    const studentCourses = await StudentCourseTable.findAll({
      where: { studentId: checkUserName.id },
      attributes: ['courseId'],
    });

    // Extract course IDs from the studentCourses
    const courseIds = studentCourses.map(sc => sc.courseId);

    // Fetch course details using `findAll`
    const courses = await CourseTable.findAll({
      where: { id: courseIds },
      attributes: ['name'],
    });

    // Fetch user data with sensitive fields excluded
    const userData = await Student.findOne({
      where: { userName, isDeleted: false },
      attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'password', 'status', 'otp'] },
    });

    res.status(200).json({
      data: { courses, userData, token, id: checkUserName.id, mobileNo: checkUserName.contactNumber },
    });

  } catch (error) {
    // console.error("Error:", error.message);
    // console.error("Stack:", error.stack);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const Logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Update the token field to null where the token matches
    const [affectedRows] = await Student.update(
      { token: null },
      { where: { token } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Token not found" });
    }

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    //console.log("req body", req.body);
    const { emailAddress } = req.body;

    if (!emailAddress) {
      return res.status(404).send({ message: "Please provide email address" });
    }

    let checkNumber = await Student.findOne({
      where: {
        emailAddress: emailAddress,
        isDeleted: false,
      },
    });

    //console.log("number is found", checkNumber);

    //generatign otp if number is found
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "123456";
    //console.log("otp is generated", otp);

    if (!checkNumber) {
      return res.status(404).send({
        message:
          "This email is not exist in our record please try with another email",
      });
    }

    //update otp in side code
    await Student.update(
      { otp: otp },
      { where: { emailAddress } } // Replace 'otp' with the actual OTP value variable
    );

    // const mailOptions = {
    //   from: `${process.env.USER_NAME}`, // sender address
    //   to: checkNumber.emailAddress, // list of receivers
    //   subject: 'Forgot-password otp is here', // Subject line
    //   text: 'Hello world this is testng mesage for you ?', // plain text body
    //   html: '<b>Hello world this is html hwllo works otp ?</b>' // html body
    // };


    const mailOptions = {
      from: process.env.USER_NAME,
      to: checkNumber.emailAddress, // List of receivers
      subject: 'Forgot Password OTP',
      text: `Hi ${checkNumber.name},\n\nWe received a request to reset your password.\n\nTo reset your password, please use the following OTP (One-Time Password):\n\n${otp}\n\nThis OTP is valid for the next 15 minutes. If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.\n\nBest regards,\n[Your Company Name] Support Team\n[support@skillontime.com]`,
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #007BFF;
        }
        .otp {
            display: block;
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
        p {
            margin: 15px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
        .logo {
            width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://skillontime.com/wp-content/uploads/2024/08/SOT001-300x200.png" alt="Company Logo" class="logo">
        <h1>Password Reset Request</h1>
        <p>Hi ${checkNumber.name},</p>
        <p>We received a request to reset your password. To proceed, please use the following One-Time Password (OTP):</p>
        <p class="otp">${otp}</p>
        <p>This OTP is valid for the next 15 minutes. If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
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
      console.log('error and info ', error, info)
      if (error) {
        return console.log('Error:', error);
      }
      console.log('Message sent: %s', info.messageId);
    });


    return res.status(200).send({ message: "An OTP has been successfully sent to your registered email. It is valid for 2 minutes." });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { contactNumber, password, otp } = req.body;

    if (!contactNumber || !password) {
      return res.status(400).json({ message: "Contact number and password are required." });
    }

    if (!otp) {
      return res.status(400).send({ message: 'otp is required' })
    }

    let checkOtp = Otp.findOne({ where: { otp: otp } })

    if (!checkOtp) {
      return res.status(500).send({ message: 'invalid otp' })
    }

    const user = await Student.findOne({ where: { contactNumber } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "An error occurred while updating the password." });
  }
};



export const otpGenerate = async (req: Request, res: Response) => {
  try {
    //console.log("req body", req.body);
    const { contactnumber } = req.body;

    if (!contactnumber) {
      return res.status(404).send({ message: "Please provide mobile number" });
    }

    let checkNumber = await Student.findOne({
      where: {
        contactnumber: contactnumber,
        isDeleted: false,
      },
    });

    console.log("number is found", checkNumber);

    //generatign otp if number is found
    // const otp = Math.floor(10000 + Math.random() * 90000).toString();
    let otp = 123456;
    //console.log("otp is generated", otp);

    if (checkNumber) {
      return res.status(404).send({
        message: "This number is already registered please go to login page",
      });
    }

    //new cheks
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const namePart = req.body.emailaddress.slice(0, 4);
    const studentId = namePart + randomNumber;

    //student id
    req.body.studentId = studentId;
    const emailMatch = req.body.emailaddress.match(/^([^@]+)@/);
    if (!emailMatch) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    //console.log('email match',emailMatch)
    const emailPart = emailMatch[1];
    //student name
    req.body.studentname = emailPart;

    //user name
    req.body.username = emailPart;

    //check if mobile no is alredy registered
    let isRegistered = await Student.findOne({
      where: { contactnumber: req.body.contactnumber },
    });
    if (isRegistered) {
      return res
        .status(400)
        .send({
          message: "This number is already registered with us",
          status: false,
        });
    }
    //refer by id
    if (req.body.referbyId) {
      let result = await Student.findOne({
        where: { studentId: req.body.referbyId },
      });
      //console.log('checking refer id in database',result);
      if (result?.studentId === req.body.referbyId) {
      } else {
        return res.status(400).send({ message: "Invalid referal code" });
      }
    } else {
      req.body.referbyId = "0001ADMIN";
    }

    //closed

    let otpRecord = await Otp.findOne({
      where: { contactnumber: req.body.contactnumber },
    });
    if (otpRecord) {
      const currentTime = new Date();
      const otpTimestamp = new Date(otpRecord.createdAt);
      const timeDifference =
        (currentTime.getTime() - otpTimestamp.getTime()) / 1000 / 60; // Time difference in minutes

      if (timeDifference < 2) {
        return res
          .status(400)
          .send({
            message:
              "Please wait for two minutes your otp has been sent to registered number",
          });
      } else {
        await Otp.destroy({ where: { contactnumber: req.body.contactnumber } });
      }
    }

    req.body.otp = otp;
    let storeOtp = await Otp.create(req.body);
    //console.log('otp stored in database',storeOtp);

    return res.status(200).send({ message: "Otp is valid of 2 minutes" });
  } catch (error) {
    //console.log("error", error);
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const forgotPasswordVerify = async (req: Request, res: Response) => {
  const { otp, emailAddress } = req.body;

  if (!otp || !emailAddress) {
    return res
      .status(400)
      .send({ message: "Otp,new password, emailAddress are required" });
  }

  try {
    // Update the password in one line
    const result = await Student.findOne({
      where: { otp, isDeleted: false, emailAddress: emailAddress },
    });

    // Check if any rows were affected
    if (result) {
      return res.status(200).send({ message: "OTP verified", status: 200 });
    }

    return res.status(200).send({ message: "Invalid Otp" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const forgotPasswordVerify3 = async (req: Request, res: Response) => {
  const { password, emailAddress, otp } = req.body;

  if (!password || !emailAddress || !otp) {
    return res
      .status(400)
      .send({ message: "Otp,new password,email are required" });
  }

  try {
    // Update the password in one line
    const result = await Student.update(
      { password: await bcrypt.hash(password, 10) },
      { where: { isDeleted: false, emailAddress: emailAddress, otp: otp } }
    );

    // Check if any rows were affected
    if (result[0] === 0) {
      return res
        .status(404)
        .send({
          message:
            "Couldn't update password please enter correct email and password",
        });
    }

    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};



export const userLoginAndPasswordUpdate = async (req: Request, res: Response) => {
  const { newPassword} = req.body;
 let id =  req.body.userId ;

  if (!newPassword) {
    return res
      .status(400)
      .send({ message: "password required" });
  }

  try {
    // Update the password in one line
    const result = await Student.update(
      { password: await bcrypt.hash(newPassword, 10),strongPassword : newPassword },
      { where: { isDeleted: false, id: id } }
    );

    // Check if any rows were affected
    if (result[0] === 0) {
      return res
        .status(404)
        .send({
          message:
            "Couldn't update password please try again later",
        });
    }
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};


//password update 
// Function to find a user by mobile number and validate password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    let userId = req.body.userId
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: " old password, and new password are required" });
    }

    // Find the user by username
    let user = await Student.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare old passwords
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await Student.update(
      { password: hashedPassword },
      { where: { id: userId, isDeleted: false } }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


//update profile photo
// Function to find a user by mobile number and validate password

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_pics'); // Directory where profile pictures will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage: storage }).single('studentProfile'); // Handling a single file upload


export const updateProfilePhoto = async (req: Request, res: Response) => {
  const id = req.body.userId;


  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "File upload failed", error: err });
    }

    try {
      if (!id) {
        return res.status(400).json({ message: "User ID is required", id });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Find the student to get the current profile photo path
      const student = await Student.findOne({
        where: { id: id, isDeleted: false },
        attributes: ['studentProfile']
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found or already deleted" });
      }
      if (student.studentProfile) {
        const oldFileName = path.basename(student.studentProfile);
        const oldFilePath = path.resolve('uploads/profile_pics', oldFileName);


        // If the student has a profile photo, delete the old file
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting old profile photo:", err);
          }
        });
      }

      // Update the studentProfile field with the new file path
      await Student.update(
        { studentProfile: `/uploads/profile_pics/${req.file.filename}` },
        { where: { id: id, isDeleted: false } }
      );

      return res.status(200).json({ message: "Profile photo updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  });
};

//get profile photo api 
export const getProfilePhoto = async (req: Request, res: Response) => {
  try {
    const id = req.body.userId;

    if (!id) {
      return res.status(400).json({ message: "studentId is required" });
    }

    // Fetch the student's profile photo URL
    const student = await Student.findOne({
      where: { id: id, isDeleted: false },
      attributes: ['studentProfile'] // Only fetch the studentProfile attribute
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Send the profile photo URL
    res.status(200).json({ profilePhoto: student.studentProfile });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


//get profile photo api 
export const checkReferalCode = async (req: Request, res: Response) => {
  try {
    const { referalCode } = req.params;

    if (!referalCode) {
      return res.status(400).json({ message: "referalCode is required" });
    }

    // Fetch the student's profile photo URL
    const student = await Student.findOne({
      where: { studentId: referalCode, isDeleted: false },
      attributes: ['studentId', 'name'] // Only fetch the studentProfile attribute
    });

    if (!student) {
      return res.status(404).json({ message: "referalCode not found" });
    }

    // Send the profile photo URL
    res.status(200).json({ referalCode: student });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


//get profile photo api 
export const ReferAndEarnMoney = async (req: Request, res: Response) => {
  try {
    const referAmount = `${process.env.REFER_WALLET_AMOUNT}`
    return res.status(200).send({ message: 'refer and earn money ', data: referAmount })

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};



//get student's analatics // for admin
export const StudentAnalatics = async (req: Request, res: Response) => {
  try {
    // Get the first and last day of the current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Query to get total registrations in the current month
    const totalRegistrationsPromise = Student.count({
      where: {
        isDeleted: false,
        createdAt: {
          [Op.between]: [firstDay, lastDay],
        },
      },
    });

    // Query to get the most popular course based on student registrations
    const popularCoursePromise = Student.findAll({
      attributes: [
        'courseName',
        [fn('COUNT', col('courseName')), 'studentCount'],
      ],
      group: 'courseName',
      order: [[fn('COUNT', col('courseName')), 'DESC']],
      limit: 1,
      where: { isDeleted: false }
    });

    // Execute both queries concurrently
    const [totalRegistrations, popularCourse] = await Promise.all([
      totalRegistrationsPromise,
      popularCoursePromise,
    ]);

    // Prepare the response
    const response = {
      totalRegistrations,
      mostPopularCourse: popularCourse.length > 0 ? popularCourse[0] : null,
    };

    return res.status(200).send({ data: response, message: 'fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}




// Route to get analytics data

// Define an interface for the response data
interface CourseRegistration {
  courseName: string;
  studentCount: number;
}

export const StudentAnalaticsTwo = async (req: Request, res: Response) => {
  try {
    // Total number of students
    const totalStudents = await Student.count();

    // Total number of unique courses
    const totalCourses = await Student.count({
      distinct: true,
      col: 'courseId'
    });

    // Number of students registered for each course
    const courseRegistrationsRaw = await Student.findAll({
      attributes: [
        'courseName',
        [Sequelize.fn('COUNT', Sequelize.col('courseName')), 'studentCount']
      ],
      group: 'courseName',
      raw: true, // Use raw query results to avoid issues with TypeScript types
    });

    // Map raw results to desired format
    const courseRegistrations: CourseRegistration[] = courseRegistrationsRaw.map((record: any) => ({
      courseName: record.courseName,
      studentCount: Number(record.studentCount)
    }));

    res.json({
      totalStudents,
      totalCourses,
      courseRegistrations,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};






interface CourseData {
  [courseName: string]: {
    totalFees: number;
    dailyFees: number[]; // Array of 7 numbers, one for each day of the week
  };
}





export const getStudentFeesRevenue = async (req: Request, res: Response) => {
  try {
    // Get the current date
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of the current day
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // End of the current day

    // Fetch data for all days
    const allData = await Student.findAll({
      attributes: [
        'courseId',
        'courseName',
        [sequelize.fn('SUM', sequelize.col('order_amount')), 'totalFees'],
        [sequelize.fn('DAYOFWEEK', sequelize.col('createdAt')), 'dayOfWeek']
      ],
      group: ['courseId', 'courseName', 'dayOfWeek'],
      order: ['courseId', 'dayOfWeek'],
      where: {
        isDeleted: false
      }
    });

    // Fetch data for today
    const todayData = await Student.findAll({
      attributes: [
        'courseId',
        'courseName',
        [sequelize.fn('SUM', sequelize.col('order_amount')), 'totalFees'],
        [sequelize.fn('DAYOFWEEK', sequelize.col('createdAt')), 'dayOfWeek']
      ],
      group: ['courseId', 'courseName', 'dayOfWeek'],
      order: ['courseId', 'dayOfWeek'],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    // Map day numbers to day names
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Process all data to get total fees and daily fees
    const courseData: CourseData = {};

    allData.forEach((item: any) => {
      const dayIndex = item.get('dayOfWeek') - 1; // Convert MySQL dayOfWeek to 0-based index
      const courseName = item.get('courseName') as string;
      const totalFees = parseFloat(item.get('totalFees')); // Ensure totalFees is a number

      if (!courseData[courseName]) {
        courseData[courseName] = {
          totalFees: 0,
          dailyFees: Array(7).fill(0) // Initialize array for all days of the week
        };
      }

      courseData[courseName].dailyFees[dayIndex] = totalFees; // Set the fees for the specific day
      courseData[courseName].totalFees += totalFees; // Add to total fees
    });

    // Process today's data to get daily fees
    todayData.forEach((item: any) => {
      const dayIndex = item.get('dayOfWeek') - 1;
      const courseName = item.get('courseName') as string;
      const totalFees = parseFloat(item.get('totalFees'));

      if (!courseData[courseName]) {
        courseData[courseName] = {
          totalFees: 0,
          dailyFees: Array(7).fill(0)
        };
      }

      courseData[courseName].dailyFees[dayIndex] = totalFees; // Update the fees for the specific day
    });

    // Determine days that have sales data
    const daysWithSales = new Set<number>();
    Object.values(courseData).forEach(data => {
      data.dailyFees.forEach((_, index) => {
        if (data.dailyFees[index] > 0) {
          daysWithSales.add(index);
        }
      });
    });

    // Convert Set to Array and sort
    const sortedDaysWithSales = Array.from(daysWithSales).sort((a, b) => a - b);

    // Format series data for chart
    const series = Object.keys(courseData).map(courseName => ({
      name: courseName,
      data: courseData[courseName].dailyFees
    }));

    // Prepare categories based on days with sales
    const categories = sortedDaysWithSales.map(dayIndex => daysOfWeek[dayIndex]);

    // Prepare total fees data
    const totalFeesData = Object.keys(courseData).map(courseName => ({
      name: courseName,
      totalFees: courseData[courseName].totalFees
    }));

    res.json({
      series,
      categories, // Dynamic categories based on days with sales
      dailyData: series,
      totalFees: totalFeesData
    });
  } catch (error) {
    console.error('Error fetching student fees data:', error);
    res.status(500).send('Internal Server Error');
  }
};
