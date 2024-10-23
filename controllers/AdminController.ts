import { fstat } from "fs";
import ContactUsForm from "../models/contactUsForm";
import { Request, Response } from 'express';
import { Admin } from "../models/adminModel";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { CourseTable } from "../models/courseModel";
import { TopicTable } from "../models/topicModel";
import { Student } from "../models/userModel";
import CounselorForm from "../models/counselorForm";
import { Op } from "sequelize";
import Counsellor_registration from "../models/counsellor_registration";

export const AdminCreate = async (req: Request, res: Response) => {
  try {
    const { email, password, mobile, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).send({ message: 'Email, password, and name are required.', status: false });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).send({ message: 'Email already in use.', status: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin record
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
      mobile,
      name,
    });

    res.status(201).send({ message: 'Admin created successfully', status: true, data: newAdmin });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal server error', status: false });
  }
};


export const AdminLogin = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;
    // Validate input
    console.log('id and passsword', email, password)

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "userName and password are required" });
    }
    // Find the user by mobile number

    let checkUserName = await Admin.findOne({
      where: { email },
    });

    if (!checkUserName) {
      return res
        .status(401)
        .send({ message: "Invalid email  or password" });
    }
    console.log('Hashed password from DB:', checkUserName.password);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, checkUserName.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid  password", isMatch });
    }

    // Generate a token
    const token = jwt.sign({ id: checkUserName.id }, `${process.env.SECRET_KEY}`, { expiresIn: '3d' });

    await Admin.update(
      { token: token },
      { where: { email } }
    );

    res
      .status(200)
      .json({
        data: { token, id: checkUserName.id, mobileNo: checkUserName },
      });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const AdminResetPassword = async (req: Request, res: Response) => {
  try {
    const { adminId, newPassword } = req.body;

    // Validate input
    if (!adminId || !newPassword) {
      return res.status(400).send({ message: "Admin ID and new password are required" });
    }

    // Find the admin by ID
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await Admin.update(
      { password: hashedPassword },
      { where: { id: adminId } }
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const AdminGet = async (req: Request, res: Response) => {
  try {
    const id = req.body.userId

    if (!id) {
      return res
        .status(400)
        .send({ message: "Admin id required " });
    }

    let findAmdin = await Admin.findByPk(id);
    if (!findAmdin) {
      return res.status(404).send({ message: "Admin not found" })
    }

    return res.status(200).json({ adminData: findAmdin })

  } catch (error) {
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const AdminGetAllCourseList = async (req: Request, res: Response) => {
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

export const AdminGetAllTopicList = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    console.log("courseId:", courseId);

    if (!courseId) {
      return res.status(400).send({ message: 'course id is required in params', status: false });
    }

    const data = await TopicTable.findAll({
      where: {
        isDeleted: false,
        courseId: courseId
      },
      attributes: ['topic', 'id']
    });

    console.log("Retrieved Topics:", data);

    return res.status(200).json({
      message: 'All topic list',
      data: data,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const AdminCreateTopic = async (req: Request, res: Response) => {
  try {

    //check that course id exist in database
    const { courseId } = req.body;
    let id = courseId;
    const response = await CourseTable.findByPk(id)
    if (!response) {
      return res.status(400).send({ message: 'please send correct course id if there is no course go and add course' })
    }

    let checkTopicDuplicate = await TopicTable.findOne({where : {topic : req.body.topic}})
    if(checkTopicDuplicate) return res.status(400).send({message : 'this topic is already exist'})

    const data = await TopicTable.create(req.body)
    res
      .status(200)
      .json({
        data: { message: 'topic created', data: data },
      });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};

export const AdminUpdateTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { name } = req.body;

    // Find the topic to update
    const topic = await TopicTable.findByPk(topicId);
    if (!topic) {
      return res.status(404).send({ message: 'Topic not found' });
    }

    // Update the topic
    topic.topic = name;
    await topic.save();

    res.status(200).json({
      data: { message: 'Topic updated successfully', topic },
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const AdminDeleteTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    // Find the topic to delete
    const topic = await TopicTable.findByPk(topicId);
    if (!topic) {
      return res.status(404).send({ message: 'Topic not found' });
    }

    // Delete the topic
    await topic.destroy();

    res.status(200).json({
      data: { message: 'Topic deleted successfully' },
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};




export const AdminCreateCourse = async (req: Request, res: Response) => {
  try {
    const response = await CourseTable.findOne({ where: { name: req.body.name } })
    if (response) {
      return res.status(400).send({ message: 'this course name is already registerd', response })
    }
    const data = await CourseTable.create(req.body)
    res
      .status(200)
      .json({
        data: { message: 'course created', data: data },
      });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


export const AdminDashboardTotal = async (req: Request, res: Response) => {
  try {
    //student all
    const students = await Student.findAll({ where: { isDeleted: false } })
    //course seller
    const courseNames = students.map(student => student.courseName);

    const courses = await CourseTable.findAll({
      where: {
        name: {
          [Op.in]: courseNames,
        },
      },
    });      //all courses
    const course = await CourseTable.findAll({ where: { isDeleted: false } })
    //counsellor 
    const counsellor = await Counsellor_registration.findAll()
    return res.status(200).send({ totalStudents: students.length, SellCourse: courses.length, allCourse: course.length, totalCounsellor: counsellor.length, message: 'all list' })
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};


//total course list admin dashboard

export const AdminDashboardTotalCourseList = async (req: Request, res: Response) => {
  try {
   // Get total number of courses
   const totalCourses = await CourseTable.count({ where: { isDeleted: false } });

   // Get unique course names from students
   const enrolledCourses = await Student.findAll({
     attributes: ['courseName'],
     group: ['courseName']
   });

   const courseNames = enrolledCourses.map(e => e.courseName);

   return res.status(200).json({
     totalCourses,
     enrolledCourses: courseNames,
     message: 'Course statistics retrieved successfully'
   });
  } catch (error) {
    //console.log("error", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
};