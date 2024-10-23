import { Request, Response } from 'express';
import { TopicTable } from '../models/topicModel';
import { DescriptionTable } from '../models/descriptionModel';
import { ShortDescriptionTable } from '../models/shortDescriptionModel';
import { NotesModel } from '../models/notesModel'
import PdfModel from '../models/pdfModel';
import { Op } from 'sequelize';
import { Student } from '../models/userModel';

// export const createNotesFunction = async (req: Request, res: Response) => {
//    const { topic, shortDescription, description,courseId } = req.body;

//    if (!topic || !shortDescription || !description || !courseId) {
//      return res.status(400).send({ message: 'All fields are required.' });
//    }

//    try {
//      // Create a new topic
//      const newTopic = await TopicTable.create({
//        topic,
//        isDeleted: false,
//        status: true,
//        courseId 
//      });

//      // Create a new short description for the topic
//      await ShortDescriptionTable.create({
//        topicId: newTopic.id, // Foreign key to TopicTable
//        shortDescription,
//        isDeleted: false,
//        status: true,
//      });

//      // Create a new description for the topic
//      await DescriptionTable.create({
//        topicId: newTopic.id, // Foreign key to TopicTable
//        description,
//        isDeleted: false,
//        status: true,
//      });

//      return res.status(201).send({ message: 'Notes created successfully', data: newTopic });
//    } catch (error) {
//      console.error('Error creating notes:', error);
//      return res.status(500).send({ message: 'Internal server error', data: error });
//    }
// }


/* export const createNotesFunction = async (req: Request, res: Response) => {
  const { topicId, title, description, courseId } = req.body;

  if (!topicId || title || !description || !courseId) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  try {
    // Check if the topic already exists
    let existingTopic = await TopicTable.findOne({
      where: { topicID, courseId, isDeleted: false },
    });

    if (existingTopic) {
      // If the topic exists, check if the short description exists
      let existingShortDescription = await ShortDescriptionTable.findOne({
        where: { topicId: existingTopic.id, isDeleted: false },
      });

      if (existingShortDescription) {
        // If the short description exists, check if the description exists
        let existingDescription = await DescriptionTable.findOne({
          where: { topicId: existingTopic.id, description, isDeleted: false },
        });

        if (existingDescription) {
          return res.status(400).send({ message: 'Description already exists.' });
        } else {
          // Create a new description if it doesn't exist
          await DescriptionTable.create({
            topicId: existingTopic.id,
            shortDescriptionId: existingShortDescription.id,
            description,
            isDeleted: false,
            status: true,
          });
        }
      } else {
        // Create a new short description if it doesn't exist
        const res = await ShortDescriptionTable.create({
          topicId: existingTopic.id,
          shortDescription,
          isDeleted: false,
          status: true,
        });

        let existingDescription = await DescriptionTable.findOne({
          where: { topicId: existingTopic.id, description, isDeleted: false },
        });

        if (!existingDescription) {
          //  Create a new description for the new short description
          await DescriptionTable.create({
            topicId: existingTopic.id,
            shortDescriptionId: res.id,
            description,
            isDeleted: false,
            status: true,
          });
        }
      }

      return res.status(200).send({ message: 'Notes updated successfully.' });
    } else {
      // Create a new topic if it doesn't exist
      const newTopic = await TopicTable.create({
        topic,
        isDeleted: false,
        status: true,
        courseId,
      });

      // Create a new short description for the new topic
      let newSave = await ShortDescriptionTable.create({
        topicId: newTopic.id,
        shortDescription,
        isDeleted: false,
        status: true,
      });

      // Create a new description for the new short description
      await DescriptionTable.create({
        topicId: newTopic.id,
        shortDescriptionId: newSave.id,
        description,
        isDeleted: false,
        status: true,
      });

      return res.status(201).send({ message: 'Notes created successfully', data: newTopic });
    }
  } catch (error) {
    console.error('Error creating notes:', error);
    return res.status(500).send({ message: 'Internal server error', data: error });
  }
}; */

export const createNotesFunction = async (req: Request, res: Response) => {
  const { topicId, title, description, courseId } = req.body;

  // if (!topicId || !title || !description || !courseId) {
  //   return res.status(400).json({ message: 'All fields are required.' });
  // }

  try {
    console.log('IDSSSSSSSs:', { topicId, courseId });

    const topicRecord = await TopicTable.findOne({
      where: { id: topicId, courseId: courseId, isDeleted: false },
    });

    if (!topicRecord) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    const note = await NotesModel.create({
      topicId,
      title,
      description,
      courseId,
      filePath: '',
      isDeleted: false,
    });

    return res.status(201).json({ message: 'Notes created successfully.', note });
  } catch (error) {
    console.error('Error creating notes:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getNotesFunction = async (req: Request, res: Response) => {
  try {
    //  const data = await TopicTable.findAll({
    //    attributes: { exclude: ["description", "createdAt", "updatedAt"] },
    //  });

    //  const transformedChapters = data.reduce((acc : any , lesson : any) => {
    //    acc[lesson.topic] = lesson.shortDescription;
    //    return acc;
    //  }, {});

    // const topics = await TopicTable.findAll({
    //    where: { isDeleted: false },
    //    attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'status'] }, // Exclude fields from TopicTable
    //    include: [
    //      {
    //        model: ShortDescriptionTable,
    //        as: 'shortdescription',
    //        where: { isDeleted: false },
    //        attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'status'] }, // Exclude fields from ShortDescriptionTable
    //        required: false,
    //      },
    //      {
    //        model: DescriptionTable,
    //        as: 'descriptiontable',
    //        where: { isDeleted: false },
    //        attributes: { exclude: ['topicId','isDeleted', 'createdAt', 'updatedAt', 'status'] }, // Exclude fields from DescriptionTable
    //        required: false,
    //      },
    //    ],
    //  });


    // const topics = await TopicTable.findAll({
    //   where: { isDeleted: false },
    //   attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'status'] },
    //   include: [
    //     {
    //       model: ShortDescriptionTable,
    //       as: 'shortdescription',
    //       where: { isDeleted: false },
    //       attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'status'] },
    //       required: false,
    //       include: [
    //         {
    //           model: DescriptionTable,
    //           as: 'descriptiontable',
    //           where: { isDeleted: false },
    //           attributes: { exclude: ['isDeleted', 'createdAt', 'updatedAt', 'status'] },
    //           required: false,
    //         },
    //       ],
    //     },
    //   ],
    // });

    console.log('studnet id ishere', req.body.userId)
    const userData = await Student.findOne({ where: { id: req.body.userId } })

    if (!userData) {
      return res.status(400).send({ message: 'student not found' })
    }

    const notes = await NotesModel.findAll({ where: { courseId: userData.courseId } })

    console.log("Notes Data:", notes);

    //all topic id is here
    const alltopic = notes.map(id => id.topicId);
    //call topic model to get all topic name 
    const alltopicNames = await TopicTable.findAll({
      where: {
        id: {
          [Op.in]: alltopic,
        },
      },
    })

    // if (!notes) return res.status(404).json({ message: "Notes are not available" })

    // Combine the notes with their corresponding topic names
    const combinedData = notes.map(note => {
      const matchingTopic = alltopicNames.find(topic => Number(topic.id) === Number(note.topicId));
      return {
        ...note.toJSON(),  // Convert the note instance to a plain object if needed
        topicName: matchingTopic ? matchingTopic.topic : null, // Assuming `name` is the field for the topic name
      };
    });

    return res.status(200).json({ message: 'Notes fetched successfully', data: combinedData });

  } catch (error) {
    return res.status(500).send({ message: 'internal server error yes error', data: error })
  }
}


export const getByCourseIdFunction = async (req: Request, res: Response) => {
  try {
    let courseId = req.params.id;
    const data = await TopicTable.findOne({
      attributes: { exclude: ["description", "createdAt", "updatedAt"] },
      where: { courseId: courseId }
    });

    return res.status(201).send({ message: 'Notes fetched successfully', data })
  } catch (error) {
    return res.status(500).send({ message: 'internal server error', data: error })
  }
}


export const deleteNotesFunction = async (req: Request, res: Response) => {

  const { id } = req.params;

  console.log("Notes id found:", id)

  if (!id) {
    return res.status(400).json({ message: 'Id is required.' });
  }

  try {
    const pdf = await PdfModel.findOne({ where: { id: id, isDeleted: false } });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found or already deleted.' });
    }

    await PdfModel.update(
      { isDeleted: true },
      { where: { id: id } }
    );

    return res.status(200).json({ message: 'Notes deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notes:', error);
    return res.status(500).json({ message: 'Internal server error', data: error });
  }
};