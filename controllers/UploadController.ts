import { Request, Response } from "express";

import multer from "multer";
import path from "path";
import fs from 'fs';

import { unlinkFile } from '../middleware/unlinkFile';

import { Student } from "../models/userModel";
import VideoModel from "../models/videoModel";
import PdfModel from "../models/pdfModel";
import { CourseTable } from "../models/courseModel";
import { TopicTable } from "../models/topicModel";
import { NotesModel } from "../models/notesModel";
// Set up Multer storage for videos
const videoStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, 'uploads/videos'); // Directory where videos will be stored
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const uploadVideo = multer({ storage: videoStorage }).single('videoFile'); // Handling a single video file upload


export const uploadCourseVideo = async (req: Request, res: Response) => {
  try {

    // Using the uploadVideo middleware to handle file upload
    uploadVideo(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload failed", error: err });
      }

      try {
        const { courseId, topicId, title, description } = req.body;
        console.log("Request Body:", title);
        console.log("Uploaded File:",);

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        if (!courseId) {
          //video is stored so if course id is not present remove that uploaded video
          //video is first uploading because of middleware
          if (req.file?.filename) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
          }
          return res.status(400).json({ message: "CourseId is required" });
        }

        if (!topicId) {
          if (req.file?.filename) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
          }
          return res.status(400).json({ message: "TopicId is required" });
        }
        //checking if course id is exist in database
        let id = courseId;
        const isCourseIdValid = await CourseTable.findByPk(id)

        if (!isCourseIdValid) {
          if (req.file?.filename) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
          }
          return res.status(400).send({ message: 'invalid course id' })
        }

        // 
        if (topicId) {
          let id = topicId;
          const isTopicIdValid = await TopicTable.findByPk(id)

          if (!isTopicIdValid) {
            if (req.file?.filename) {
              const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
                ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
                : null;
              if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
            }
            return res.status(400).send({ message: 'invalid topic id' })
          }
        }

        // Fetch the course record by ID
        const course = await VideoModel.findOne({
          where: { topicId: topicId, isDeleted: false },
          attributes: ["filePath"],
        });

        if (!course) {
          let data = {
            title: req.body.title,
            filePath: `/uploads/videos/${req.file.filename}`,
            courseId: req.body.courseId,
            topicId: topicId,
            description: description
          }
          const course = await VideoModel.create(data);
          return res.status(404).json({ message: "video uploaded" });
        }

        // Get the old video file path if it exists
        const oldVideoFilePath = course.filePath
          ? path.resolve("uploads/videos", path.basename(course.filePath))
          : null;

        // Update the course video field with the new file path
        await VideoModel.update(
          {
            filePath: `/uploads/videos/${req.file.filename}`, title: title,
            description: description
          },
          { where: { courseId: courseId, isDeleted: false } }
        );

        // If there was an old video, delete the old file
        if (oldVideoFilePath && fs.existsSync(oldVideoFilePath)) {
          fs.unlink(oldVideoFilePath, (err) => {
            if (err) {
              console.error("Error deleting old video:", err);
            }
          });
        }

        return res.status(200).json({ message: "Video uploaded and updated successfully" });
      } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error", error });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCourseVideo = async (req: Request, res: Response) => {
  try {
    // Use multer middleware to handle file upload
    uploadVideo(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload failed", error: err.message });
      }

      try {
        const { videoId } = req.params;
        const { courseId, topicId, title, description } = req.body;
        const uploadedFile = req.file;

        // Validate input
        if (!videoId) {
          return res.status(400).json({ message: "VideoId is required" });
        }
        if (!courseId) {
          // Remove uploaded file if courseId is missing
          if (uploadedFile?.filename) {
            const uploadedFilePath = path.resolve('uploads/videos', uploadedFile.filename);
            if (fs.existsSync(uploadedFilePath)) {
              fs.unlinkSync(uploadedFilePath);
            }
          }
          return res.status(400).json({ message: "CourseId is required" });
        }
        if (!topicId) {
          // Remove uploaded file if topicId is missing
          if (uploadedFile?.filename) {
            const uploadedFilePath = path.resolve('uploads/videos', uploadedFile.filename);
            if (fs.existsSync(uploadedFilePath)) {
              fs.unlinkSync(uploadedFilePath);
            }
          }
          return res.status(400).json({ message: "TopicId is required" });
        }

        // Check if courseId is valid
        const courseExists = await CourseTable.findByPk(courseId);
        if (!courseExists) {
          if (uploadedFile?.filename) {
            const uploadedFilePath = path.resolve('uploads/videos', uploadedFile.filename);
            if (fs.existsSync(uploadedFilePath)) {
              fs.unlinkSync(uploadedFilePath);
            }
          }
          return res.status(400).json({ message: "Invalid courseId" });
        }

        // Check if topicId is valid
        if (topicId) {
          const topicExists = await TopicTable.findByPk(topicId);
          if (!topicExists) {
            if (uploadedFile?.filename) {
              const uploadedFilePath = path.resolve('uploads/videos', uploadedFile.filename);
              if (fs.existsSync(uploadedFilePath)) {
                fs.unlinkSync(uploadedFilePath);
              }
            }
            return res.status(400).json({ message: "Invalid topicId" });
          }
        }

        // Fetch the existing video record
        const video = await VideoModel.findByPk(videoId);

        if (!video) {
          if (uploadedFile?.filename) {
            const uploadedFilePath = path.resolve('uploads/videos', uploadedFile.filename);
            if (fs.existsSync(uploadedFilePath)) {
              fs.unlinkSync(uploadedFilePath);
            }
          }
          return res.status(404).json({ message: "Video not found" });
        }

        // Prepare data for update
        const updateData: any = {
          title,
          description,
        };

        if (uploadedFile) {
          updateData.filePath = `/uploads/videos/${uploadedFile.filename}`;
          // Delete the old video file if it exists
          const oldVideoFilePath = video.filePath ? path.resolve('uploads/videos', path.basename(video.filePath)) : null;
          if (oldVideoFilePath && fs.existsSync(oldVideoFilePath)) {
            fs.unlinkSync(oldVideoFilePath);
          }
        }

        // Update video record
        await VideoModel.update(updateData, { where: { id: videoId } });

        return res.status(200).json({ message: "Video updated successfully" });

      } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCourseVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    // Validate input
    if (!videoId) {
      return res.status(400).json({ message: "VideoId is required" });
    }

    // Fetch the video record by ID
    const video = await VideoModel.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete the video file from the filesystem if it exists
    if (video.filePath) {
      const videoFilePath = path.resolve('uploads/videos', path.basename(video.filePath));
      if (fs.existsSync(videoFilePath)) {
        fs.unlinkSync(videoFilePath);
      }
    }

    // Delete the video record from the database
    await VideoModel.destroy({ where: { id: videoId } });

    return res.status(200).json({ message: "Video deleted successfully" });

  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// export const uploadCourseVideo = async (req: Request, res: Response) => {
//   try {
//     // First, validate request body
//     const { courseId, topicId, title } = req.body;
//     console.log('bodydata',req.body);

//     if (!courseId) {
//       return res.status(400).json({ message: "CourseId is required" });
//     }

//     if (!topicId) {
//       return res.status(400).json({ message: "TopicId is required" });
//     }

//     // Use the uploadVideo middleware to handle file upload
//     uploadVideo(req, res, async (err) => {
//       if (err) {
//         return res.status(500).json({ message: "File upload failed", error: err });
//       }

//       try {
//         if (!req.file) {
//           return res.status(400).json({ message: "No file uploaded" });
//         }

//         // Fetch the existing video record by courseId
//         const existingVideo = await VideoModel.findOne({
//           where: { courseId: courseId, isDeleted: false },
//           attributes: ["filePath"],
//         });

//         if (!existingVideo) {
//           // Create a new video record if none exists for the courseId
//           const newVideo = {
//             title: title,
//             filePath: `/uploads/videos/${req.file.filename}`,
//             courseId: courseId
//           };
//           await VideoModel.create(newVideo);
//           return res.status(201).json({ message: "Video uploaded and created successfully" });
//         }

//         // Get the old video file path if it exists
//         const oldVideoFilePath = existingVideo.filePath
//           ? path.resolve("uploads/videos", path.basename(existingVideo.filePath))
//           : null;

//         // Update the existing video record with the new file path
//         await VideoModel.update(
//           { filePath: `/uploads/videos/${req.file.filename}` },
//           { where: { courseId: courseId, isDeleted: false } }
//         );

//         // If there was an old video, delete the old file
//         if (oldVideoFilePath && fs.existsSync(oldVideoFilePath)) {
//           fs.unlink(oldVideoFilePath, (err) => {
//             if (err) {
//               console.error("Error deleting old video:", err);
//             }
//           });
//         }

//         return res.status(200).json({ message: "Video uploaded and updated successfully" });
//       } catch (error) {
//         console.error("Internal server error:", error);
//         return res.status(500).json({ message: "Internal server error", error });
//       }
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


export const getAllVideos = async (_req: Request, res: Response) => {
  try {
    const data = await VideoModel.findAll();
    return res.status(200).send({ data });
  } catch (error) {
    return res.status(500).send({ error: "Server Error" });
  }
};


export const getCourseVideo = async (req: Request, res: Response) => {
  const videoId = req.params.id; // Assuming you're fetching the video based on an ID

  try {
    // Find the student in the database to get the video path
    const videoGet = await VideoModel.findOne({
      where: { id: videoId, isDeleted: false },
      attributes: ['filePath']
    });

    if (!videoGet || !videoGet.filePath) {
      return res.status(404).json({ message: "Video not found or student does not exist" });
    }

    const videoPath = path.resolve(`.${videoGet.filePath}`); // Full path to the video file

    // Check if the file exists
    if (fs.existsSync(videoPath)) {
      // Get the video file stats
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Parse Range header to handle partial content (video streaming)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
          return;
        }

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4', // Adjust content type based on your video format
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        // Serve the full video
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4', // Adjust content type based on your video format
        };

        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } else {
      return res.status(404).json({ message: "Video file not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};


//upload pdf 
const PdfStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, 'uploads/pdfFiles'); // Directory where videos will be stored
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const uploadPdf = multer({ storage: PdfStorage }).single('pdfFile'); // Handling a single pdf file upload


/* export const uploadCoursePdf = async (req: Request, res: Response) => {
  try {
    // Using the uploadVideo middleware to handle file upload
    uploadPdf(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload failed", error: err });
      }

      try {
        const { courseId, title, topicId, description } = req.body;
        console.log("Request Body:", title);
        console.log("Uploaded File:",);

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        if (!courseId) {
          //if course id not found remove uploaded course pdf
          if (req.file?.filename) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
          }
          return res.status(400).json({ message: "Course ID is required" });
        }

        if (!topicId) {
          //if topic id not found remove uploaded pdf file
          if (req.file?.filename) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
          }
          return res.status(400).json({ message: "topic Id required" });
        }

        //if course id is comming chat it is exist  in database 
        if (courseId) {
          const isCourseIdValid = await CourseTable.findOne({
            where: { id: courseId }
          });
          if (!isCourseIdValid) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
            return res.status(400).json({ message: "course id invalid" });
          }
        }


        if (topicId) {
          const isTopicIdValid = await TopicTable.findOne({
            where: { id: courseId }
          });
          if (!isTopicIdValid) {
            const oldVideoFilePath = `/uploads/videos/${req.file.filename}`
              ? path.resolve("uploads/videos", path.basename(`/uploads/videos/${req.file.filename}`))
              : null;
            if (oldVideoFilePath) unlinkFile(oldVideoFilePath);
            return res.status(400).json({ message: "course id invalid" });
          }
        }


        // Fetch the course record by ID
        const course = await PdfModel.findOne({
          where: { courseId: courseId, isDeleted: false },
          attributes: ["filePath"],
        });

        if (!course) {
          let data = {
            title: req.body.title,
            filePath: `/uploads/pdfFiles/${req.file.filename}`,
            courseId: req.body.courseId,
            topicId: topicId,
            description: description
          }
          const course = await PdfModel.create(data);
          return res.status(404).json({ message: "pdf uploaded", course });
        }

        // Get the old video file path if it exists
        const oldVideoFilePath = course.filePath
          ? path.resolve("uploads/pdfFiles", path.basename(course.filePath))
          : null;

        // Update the course video field with the new file path
        await PdfModel.update(
          { filePath: `/uploads/pdfFiles/${req.file.filename}`, title, description },
          { where: { courseId: courseId, isDeleted: false } }
        );

        // If there was an old video, delete the old file
        if (oldVideoFilePath && fs.existsSync(oldVideoFilePath)) {
          fs.unlink(oldVideoFilePath, (err) => {
            if (err) {
              console.error("Error deleting old pdf:", err);
            }
          });
        }

        return res.status(200).json({ message: "pdf uploaded and updated successfully" });
      } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error", error });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; */

export const uploadCoursePdf = async (req: Request, res: Response) => {
  try {
    // Using the uploadPdf middleware to handle file upload
    uploadPdf(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload failed", error: err });
      }

      try {
        const { courseId, title, topicId, description } = req.body;
        console.log("Request Body:", title);
        console.log("Uploaded File:", req.file);

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        if (!courseId) {
          if (req.file?.filename) {
            const oldPdfFilePath = req.file.filename
              ? path.resolve("uploads/pdfFiles", path.basename(req.file.filename))
              : null;
            if (oldPdfFilePath) unlinkFile(oldPdfFilePath);
          }
          return res.status(400).json({ message: "Course ID is required" });
        }

        if (!topicId) {
          if (req.file?.filename) {
            const oldPdfFilePath = req.file.filename
              ? path.resolve("uploads/pdfFiles", path.basename(req.file.filename))
              : null;
            if (oldPdfFilePath) unlinkFile(oldPdfFilePath);
          }
          return res.status(400).json({ message: "Topic ID is required" });
        }

        // Validate courseId
        const isCourseIdValid = await CourseTable.findOne({
          where: { id: courseId }
        });
        if (!isCourseIdValid) {
          if (req.file?.filename) {
            const oldPdfFilePath = req.file.filename
              ? path.resolve("uploads/pdfFiles", path.basename(req.file.filename))
              : null;
            if (oldPdfFilePath) unlinkFile(oldPdfFilePath);
          }
          return res.status(400).json({ message: "Course ID is invalid" });
        }

        // Validate topicId
        const isTopicIdValid = await TopicTable.findOne({
          where: { id: topicId }
        });
        if (!isTopicIdValid) {
          if (req.file?.filename) {
            const oldPdfFilePath = req.file.filename
              ? path.resolve("uploads/pdfFiles", path.basename(req.file.filename))
              : null;
            if (oldPdfFilePath) unlinkFile(oldPdfFilePath);
          }
          return res.status(400).json({ message: "Topic ID is invalid" });
        }

        // Fetch the course record by ID
        const course = await PdfModel.findOne({
          where: { topicId: topicId, isDeleted: false },
          attributes: ["filePath"],
        });

        if (!course) {
          const data = {
            title: req.body.title,
            filePath: `/uploads/pdfFiles/${req.file.filename}`,
            courseId: req.body.courseId,
            topicId: topicId,
            description: description
          };
          const newPdf = await PdfModel.create(data);

          // Create a new note
          await NotesModel.create({
            title,
            filePath: `/uploads/pdfFiles/${req.file.filename}`,
            courseId,
            topicId,
            description
          });

          return res.status(200).json({ message: "PDF uploaded and note created", pdf: newPdf });
        }

        // Get the old PDF file path if it exists
        const oldPdfFilePath = course.filePath
          ? path.resolve("uploads/pdfFiles", path.basename(course.filePath))
          : null;

        // Update the course PDF field with the new file path
        await PdfModel.update(
          { filePath: `/uploads/pdfFiles/${req.file.filename}`, title, description },
          { where: { courseId: courseId, isDeleted: false } }
        );

        // If there was an old PDF, delete the old file
        if (oldPdfFilePath && fs.existsSync(oldPdfFilePath)) {
          fs.unlink(oldPdfFilePath, (err) => {
            if (err) {
              console.error("Error deleting old PDF:", err);
            }
          });
        }

        // Create or update the note
        await NotesModel.upsert({
          title,
          filePath: `/uploads/pdfFiles/${req.file.filename}`,
          courseId,
          topicId,
          description
        });

        return res.status(200).json({ message: "PDF uploaded and updated successfully" });
      } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error", error });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCoursePdf = async (req: Request, res: Response) => {
  const pdfId = req.params.id; // Assuming you're fetching the PDF based on an ID

  try {
    // Find the PDF in the database to get the file path
    const pdfGet = await PdfModel.findOne({
      where: { id: pdfId, isDeleted: false },
      attributes: ['filePath']
    });

    if (!pdfGet || !pdfGet.filePath) {
      return res.status(404).json({ message: "PDF not found or document does not exist" });
    }

    const pdfPath = path.resolve(`.${pdfGet.filePath}`); // Full path to the PDF file
    console.log('full path of pdf', pdfPath);
    // Check if the file exists
    if (fs.existsSync(pdfPath)) {
      // Get the PDF file stats
      const stat = fs.statSync(pdfPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Parse Range header to handle partial content (PDF streaming)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
          return;
        }

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(pdfPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'application/pdf', // Adjust content type for PDFs
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        // Serve the full PDF
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'application/pdf', // Adjust content type for PDFs
        };

        res.writeHead(200, head);
        fs.createReadStream(pdfPath).pipe(res);
      }
    } else {
      return res.status(404).json({ message: "PDF file not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllCoursePdf = async (req: Request, res: Response) => {
  try {
    const pdfGet = await PdfModel.findAll({
      where: { isDeleted: false },
    });

    if (pdfGet.length === 0) {
      return res.status(404).json({ message: "No PDFs found" });
    }
    return res.status(200).json(pdfGet);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};