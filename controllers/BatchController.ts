import { Request, Response } from 'express'
import { BatchModelTable } from '../models/batchModelTable'
import { CourseTable } from '../models/courseModel'

// Create a new Batch
export const createBatch = async (req: Request, res: Response) => {
    try {
        const { courseId, totalStudent, remainingStudent, batchName, registrationStartDate } = req.body

        // if (!courseId || !totalStudent || remainingStudent || batchName || registrationStartDate) {
        //     return res.status(400).json({ error: 'All fields are required.' })
        // }

        const course = await CourseTable.findByPk(courseId)
        if (!course) return res.status(404).json({ error: 'Course Not Found.' })

        const batch = await BatchModelTable.create(req.body)

        return res.status(201).json({ message: 'Batch created successfully.', batch })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while creating the Batch.', error2: error })
    }
}

// Get all Batches
export const getAllBatch = async (req: Request, res: Response) => {
    try {
        // Fetch all batches
        const batches = await BatchModelTable.findAll({
            where: { isDeleted: false },
        });

        console.log('Batches:', batches);

        if (batches.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No batches found'
            });
        }

        // Collect course IDs
        const courseIds = [...new Set(batches.map(batch => batch.courseId))]; // Remove duplicates

        // Debugging: Log course IDs
        console.log('Course IDs:', courseIds);

        if (courseIds.length === 0) {
            return res.status(200).json({
                data: batches,
                message: 'No courses found for batches'
            });
        }

        // Fetch course details for the collected IDs
        const courses = await CourseTable.findAll({
            where: {
                id: courseIds
            },
            attributes: ['id', 'name'] // Include only necessary fields
        });

        // Debugging: Log courses
        console.log('Courses:', courses);

        // Map course data to a dictionary for easy lookup
        const courseMap = courses.reduce((acc, course) => {
            acc[course.id] = course.name;
            return acc;
        }, {} as { [key: number]: string });

        // Debugging: Log courseMap
        console.log('Course Map:', courseMap);

        // Include course names in batch data
        const batchesWithCourses = batches.map(batch => ({
            ...batch.toJSON(),
            courseName: courseMap[batch.courseId] || 'Unknown Course'
        }));

        // Debugging: Log batches with course names
        console.log('Batches with Courses:', batchesWithCourses);

        return res.status(200).json({
            data: batchesWithCourses,
            message: 'All batch list with course names'
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while fetching Batches.' })
    }
}

// Get an Batch by ID
export const getSingleBatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const batch = await BatchModelTable.findByPk(id)

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found.' })
        }

        return res.json(batch)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while fetching the Batches.' })
    }
}

// Get an Batch by ID
export const deleteBatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Batch ID is required" })
        }

        const [updatedRowsCount] = await BatchModelTable.update(
            { isDeleted: true },
            {
                where: { id: id, isDeleted: false },
            }
        )

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: "Batch not found" })
        }
        return res.status(200).json({ message: 'Batch deleted' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'An error occurred while deleting the Batches.' })
    }
}

// Update an existing Batch
export const updateBatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { courseId, totalStudent, remainingStudent, batchName,RegistrationStartDate, registrationEndDate } = req.body;
          
        console.log('update batch',req.body)

        const course = await CourseTable.findByPk(courseId);
        if (!course) {
            res.status(404).json({ error: 'Course Not Found.' });
            return;
        }

        const batch = await BatchModelTable.findByPk(id);
        if (!batch) {
            res.status(404).json({
                message: 'Batch not found',
            });
            return;
        }

        batch.courseId = courseId;
        batch.totalStudent = totalStudent;
        batch.remainingStudent = remainingStudent;
        batch.batchName = batchName;
        batch.RegistrationStartDate = RegistrationStartDate;

      const data =  await batch.save();

        res.status(200).json({message: 'Batch updated successfully', data });
    } catch (error: any) {
        res.status(500).json({message: 'Failed to update batch', error: error.message,});
    }
};