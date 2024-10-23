import { Request, Response } from "express";
import { Teacher } from "../models/teacherModel";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import { transporter } from "../middleware/nodeMailer";
import { generateStrongPassword } from "./userController";

// Create a new teacher
export const createTeacher = async (req: Request, res: Response) => {
    try {
        const { fullName, contactNumber, email } = req.body;

        const existingTeacher = await Teacher.findOne({ where: { contactNumber } });

        if (existingTeacher) {
            res.status(409).json({ message: 'Teacher with this contact number already exists.' });
            return;
        }

        const existingEmail = await Teacher.findOne({ where: { email } });

        if (existingEmail) {
            res.status(409).json({ message: 'Teacher with this email already exists.' });
            return;
        }

        const data = { contactnumber: contactNumber, emailaddress: email };
        const strongPassword = generateStrongPassword(data);

        const hashedPassword = await bcrypt.hash(strongPassword, 10);

        const newTeacher = await Teacher.create({
            fullName,
            contactNumber,
            email,
            password: hashedPassword,
        });

        const mailOptions = {
            from: process.env.USER_NAME,
            to: newTeacher.email,
            subject: 'Welcome to Skillontime! Your Account Details',
            text: `Hi ${newTeacher.fullName},\n\nWelcome to Skillontime!\n\nYour account has been successfully created. Here are your login details:\n\nUsername: ${newTeacher.fullName}\nPassword: ${strongPassword}\n\nPlease make sure to keep your password safe and secure. If you have any questions or need assistance, feel free to contact our support team.\n\nBest regards,\nSkillontime Support Team\nsupport@skillontime.com`,
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
            <p>Hi ${newTeacher.fullName},</p>
            <p>Welcome to Skillontime! Your account has been successfully created. Below are your login details:</p>
            <div class="details">
              <p><strong>Username:</strong> ${newTeacher.fullName}</p>
              <p><strong>Password:</strong> ${strongPassword}</p>
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

        res.status(201).json({
            message: 'Teacher created successfully',
            teacher: newTeacher,
            password: strongPassword,
        });
    } catch (error: any) {
        res.status(500).json({
            message: 'Failed to create teacher',
            error: error.message,
        });
    }
};

// Update an existing teacher
export const updateTeacher = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fullName, contactNumber, email } = req.body;

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
            return;
        }

        teacher.fullName = fullName;
        teacher.contactNumber = contactNumber;
        teacher.email = email;

        await teacher.save();

        res.status(200).json({ message: 'Teacher updated successfully', teacher });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update teacher', error: error.message });
    }
};

// Delete a teacher
export const deleteTeacher = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Teacher ID is required" })
        }

        const [updatedRowsCount] = await Teacher.update(
            { isDeleted: true },
            {
                where: { id: id, isDeleted: false },
            }
        )

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: "Teacher not found" })
        }
        return res.status(200).json({ message: 'Teacher deleted' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while fetching the Teacher.' })
    }
}

// Get all teachers
export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await Teacher.findAll();
        res.status(200).json({ teachers });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to get all teachers', error: error.message });
    }
};

// Get teacher by ID
export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
            return;
        }

        res.status(200).json({ teacher });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to get teacher by ID', error: error.message });
    }
};


/*
// Teacher login
export const teacherLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const teacher = await Teacher.findOne({ where: { email } });
        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, teacher.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        const token = jwt.sign(
            { id: teacher.id, email: teacher.email },
            `${process.env.SECRET_KEY}`
        );

        await Teacher.update({ token }, { where: { email } });

        res.status(200).json({ message: 'Success', token });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to login teacher', error: error.message });
    }
};

// Get teacher details by ID (based on the token)
export const getTeacherDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const teacher = await Teacher.findOne({ where: { id: userId } });

        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found', userId });
            return;
        }

        res.status(200).json({ status: true, message: 'User details fetched successfully', data: teacher });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch teacher details', error: error.message });
    }
};

// Teacher logout
export const teacherLogout = async (req: Request, res: Response) => {
    try {
        const token = req.headers["authorization"];

        const teacher = await Teacher.findOne({ where: { token } });

        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found', token });
            return;
        }

        await Teacher.update({ token: null }, { where: { token } });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to logout teacher', error: error.message });
    }
}; */

// List courses (assuming this is related to a CourseTable model)
/* export const teacherCourseList = async (req: Request, res: Response) => {
    try {
        const data = await CourseTable.findAll();
        return res.status(200).json({ message: 'Success', data });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch course list', error: error.message });
    }
}; */