import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Test from '../models/testModelTable';

// Create a new test question
// export const createTest = async (req: Request, res: Response) => {
//     try {
//         // const { title, question, options, correctAnswer } = req.body;

//         // Validate the input (optional, add more checks as needed)
//         // if (!title || !question || !options || !Array.isArray(options)) {
//         //     res.status(400).json({ error: 'Invalid input' });
//         //     return;
//         // }

//         const newTest = await Test.create(req.body);
//         res.status(201).json(newTest);
//     } catch (error) {
//         res.status(500).json({ error: 'Error creating test question' });
//     }
// };

export const uploadTestPdf = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file type' });
        }

        const filePath = req.file.path.replace(/\\/g, '/');

        const newTest = await Test.create({ filePath, ...req.body });

        res.status(201).json(newTest);
    } catch (error) {
        res.status(500).json({ error: 'Error uploading PDF and creating test question' });
    }
};

// Get all test questions
export const getTests = async (_req: Request, res: Response) => {
    try {
        const tests = await Test.findAll();
        console.log("All tests details:", tests)
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching test questions' });
    }
};

// Get a single test question by ID
export const getTestById = async (req: Request, res: Response) => {
    try {
        const test = await Test.findByPk(req.params.id);
        if (test) {
            res.status(200).json(test);
        } else {
            res.status(404).json({ error: 'Test question not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching test question' });
    }
};

// Update a test question
export const updateTest = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file type' });
        }

        const filePath = req.file.path.replace(/\\/g, '/');

        const existingTest = await Test.findByPk(req.params.id);
        if (!existingTest) {
            return res.status(404).json({ error: 'Test question not found' });
        }

        const oldFilePath = path.resolve(existingTest.filePath);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        const [updated] = await Test.update(
            { filePath, ...req.body },
            { where: { id: req.params.id } }
        );

        if (updated) {
            const updatedTest = await Test.findByPk(req.params.id);
            res.status(200).json(updatedTest);
        } else {
            res.status(404).json({ error: 'Test question not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating test question' });
    }
};

// Delete a test question
export const deleteTest = async (req: Request, res: Response) => {
    try {
        const existingTest = await Test.findByPk(req.params.id);
        if (!existingTest) {
            return res.status(404).json({ error: 'Test question not found' });
        }

        const oldFilePath = path.resolve(existingTest.filePath);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        const deleted = await Test.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).json({ message: "Test Deleted" });
        } else {
            res.status(404).json({ error: 'Test question not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting test question' });
    }
};