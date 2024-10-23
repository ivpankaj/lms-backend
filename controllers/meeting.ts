import { Request, Response } from "express";
import { Meeting } from "../models/meeting";
import { CourseTable } from "../models/courseModel";

// Create a new meeting
export const createMeeting = async (req: Request, res: Response) => {
  const { courseId, title, description, link } = req.body;
  let id = courseId;
  const isCourseIdValid = await CourseTable.findByPk(id);

  if (!isCourseIdValid) {
    return res.status(400).send({ message: "invalid course id" });
  }
  try {
    const newMeeting = await Meeting.create({
      courseId,
      title,
      description,
      link,
    });
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(500).json({ error: "Failed to create meeting" });
  }
};

// Get all meetings
export const getAllMeetings = async (req: Request, res: Response) => {
    try {
      const meetings = await Meeting.findAll(); // Fetch all meetings without any condition
      res.status(200).json(meetings);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve meetings" });
    }
  };

export const getMeetingsByCourseId = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  try {
    const meetings = await Meeting.findAll({
      where: { courseId },
    });

    if (meetings.length === 0) {
      return res
        .status(404)
        .json({ message: "No meetings found for this course" });
    }

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
};
// Get a meeting by ID
export const getMeetingById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const meeting = await Meeting.findByPk(id);
    if (!meeting || meeting.isDeleted) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve meeting" });
  }
};

// Update a meeting
export const updateMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, link } = req.body;

  try {
    const meeting = await Meeting.findByPk(id);
    if (!meeting ) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    meeting.title = title ?? meeting.title;
    meeting.description = description ?? meeting.description;
    meeting.link = link ?? meeting.link;

    await meeting.save();
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ error: "Failed to update meeting" });
  }
};

// Soft delete a meeting
export const deleteMeeting = async (req: Request, res: Response) => {
    const { id } = req.params; // Extract the ID from the request parameters
    console.log("hello", id);
    
    try {
      const meeting = await Meeting.findByPk(id); // Find the meeting by primary key
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      await meeting.destroy(); // Delete the meeting from the database
      res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meeting" });
    }
  };