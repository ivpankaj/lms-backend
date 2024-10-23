import { Request, Response } from 'express';
import { MCQ } from '../models/mcqModelTable';
import { CourseTable } from '../models/courseModel';
import { TopicTable } from '../models/topicModel';
import { Student } from '../models/userModel';
import {UserAnswer} from '../models/mcqResultTable';

// Get all MCQs
export const getAllMCQs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userData = await Student.findOne({ where: { id: req.body.userId } })

    if (!userData) {
      return res.status(400).send({ message: 'student not found' })
    }
    const mcqs = await MCQ.findAll({ where: { courseId: userData.courseId } });

    console.log("MCQs data:", mcqs)

    return res.json(mcqs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching MCQs.' });
  }
};



export const getAllMCQsForAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
  
    const mcqs = await MCQ.findAll();

    console.log("MCQs data:", mcqs)

    return res.json(mcqs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching MCQs.' });
  }
};

// Get an MCQ by ID
export const getMCQById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const mcqId = parseInt(req.params.id, 10);

    const mcq = await MCQ.findByPk(mcqId);

    if (!mcq) {
      return res.status(404).json({ error: 'MCQ not found.' });
    }

    return res.json(mcq);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching the MCQ.' });
  }
};

export const createMCQAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const mcqs = Array.isArray(req.body) ? req.body : [req.body];
    const createdMCQs = [];

    for (const mcqData of mcqs) {
      // console.log("MCQ Data in mcqall create", mcqData);

      const { title, courseId, topicId, question_text, answer_key, correct_option } = mcqData;

      // Validate required fields
      if (!title || !courseId || !topicId || !question_text || !Array.isArray(answer_key) || correct_option == null) {
        return res.status(400).json({ error: 'All fields are required and must be valid.' });
      }

      const course = await CourseTable.findByPk(courseId);

      if (!course) {
        return res.status(404).json({ error: `Course not found for courseId: ${courseId}.` });
      }

      // Check if the topic exists and belongs to the selected course
      const topic = await TopicTable.findOne({ where: { id: topicId, courseId } });
      if (!topic) {
        return res.status(404).json({ error: `Topic not found or does not belong to the selected course for topicId: ${topicId}.` });
      }

      // Create the MCQ
      const createdMCQ = await MCQ.create({
        title,
        courseId,
        topicId,
        question_text,
        answer_key,
        correct_option,
      });

      createdMCQs.push(createdMCQ);
    }

    return res.status(201).json({ message: 'MCQ(s) created successfully.', mcqs: createdMCQs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while creating the MCQ(s).', details: error });
  }
};

export const updateMCQ = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, courseId, topicId, question_text, answer_key, correct_option } = req.body;


    if (!title || !courseId || !topicId || !question_text || !Array.isArray(answer_key) || correct_option == null) {
      return res.status(400).json({ error: 'All fields are required and must be valid.' });
    }

    const mcq = await MCQ.findByPk(id);
    if (!mcq) {
      return res.status(404).json({ error: `MCQ not found for id: ${id}.` });
    }

    const course = await CourseTable.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: `Course not found for courseId: ${courseId}.` });
    }

    const topic = await TopicTable.findOne({ where: { id: topicId, courseId } });
    if (!topic) {
      return res.status(404).json({ error: `Topic not found or does not belong to the selected course for topicId: ${topicId}.` });
    }

    const updatedMCQ = await mcq.update({
      title,
      courseId,
      topicId,
      question_text,
      answer_key,
      correct_option,
    });

    return res.status(200).json({ message: 'MCQ updated successfully.', mcq: updatedMCQ });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while updating the MCQ.', details: error });
  }
};


export const deleteMCQ = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const mcq = await MCQ.findByPk(id);
    if (!mcq) {
      return res.status(404).json({ error: `MCQ not found for id: ${id}.` });
    }

    await mcq.destroy();

    return res.status(200).json({ message: 'MCQ deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while deleting the MCQ.', details: error });
  }
};



// Get all MCQ titles
export const getAllTitles = async (req: Request, res: Response) => {
  try {
    const titles = await MCQ.findAll({
      attributes: ['title'],
      group: ['title'],
    });

    const uniqueTitles = [...new Set(titles.map(t => t.title))];

    return res.json(uniqueTitles);
  } catch (error) {
    console.error('Error fetching titles:', error);
    return res.status(500).json({ error: 'An error occurred while fetching titles.' });
  }
};

// Get MCQs by title
export const getQuestionsByTitle = async (req: Request, res: Response) => {
  const { titleId } = req.params;
  try {
    const mcqs = await MCQ.findAll({
      where: { title: titleId },
    });

    // Parse answer_key if it's a string
    mcqs.forEach((mcq) => {
      if (typeof mcq.answer_key === 'string') {
        mcq.answer_key = JSON.parse(mcq.answer_key);
      }
    });

    return res.json(mcqs);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'An error occurred while fetching questions.' });
  }
};



// Fetch user's previous answers for a given quiz
export const getPastResults = async (req: Request, res: Response) => {
  const {titleId } = req.params;
  const  userId  = req.body.userId;
  try {
    const pastResults = await UserAnswer.findOne({
      where: { user_id: userId, quiz_id: titleId },
    });

    if (!pastResults) {
      return res.status(404).json({ error: 'No past results found for this quiz.' });
    }


    return res.json(pastResults);
  } catch (error) {
    console.error('Error fetching past results:', error);
    return res.status(500).json({ error: 'An error occurred while fetching past results.' });
  }
};


// Save user answers
export const saveUserAnswers = async (req: Request, res: Response) => {
  const { titleId, answers, score } = req.body;
  const  userId  = req.body.userId;

  if (!titleId || !answers || score === undefined || !userId) {
    return res.status(400).json({ error: 'Invalid input data.' });
  }

  try {

    const alreadyCheck = await UserAnswer.findOne({ where : {quiz_id: titleId}})
    if(alreadyCheck) return res.status(400).send({message : 'already attempted'})
    // Create a new record in UserAnswer
    await UserAnswer.create({
      user_id: userId,
      quiz_id: titleId,
      answers: answers, // Ensure answers are stored as JSON string
      score,
    });


    return res.status(200).json({ message: 'Answers saved successfully.' });
  } catch (error) {
    console.error('Error saving answers:', error);
    return res.status(500).json({ error: 'An error occurred while saving answers.' });
  }
};



//save mcq result 

export const SaveAnswers =  async (req:Request, res:Response) => {
  const { quizId, answers, score } = req.body;
  const userId  = req.body.userId
  try {
    await UserAnswer.create({
      user_id: userId,
      quiz_id: quizId,
      answers,
      score,
    });

    res.status(200).json({ message: 'Quiz results saved successfully.' });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

