import { Request, Response } from 'express';
import { Project } from '../models/projectModelTable';

// Create a new Project
export const createProject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { title, description, projects } = req.body;

        if (!title || !description || !Array.isArray(projects)) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Create the Project
        const project = await Project.create(req.body);

        return res.status(201).json({ message: 'Project created successfully.', project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while creating the Project.', error2: error });
    }
};

// Get all Projects
export const getAllProjects = async (req: Request, res: Response): Promise<Response> => {
    try {
        const projects = await Project.findAll();

        return res.json(projects);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching Projects.' });
    }
};

// Get an Project by ID
export const getSingleProject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const projectId = parseInt(req.params.id, 10);

        const project = await Project.findByPk(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        return res.json(project);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching the Project.' });
    }
};


export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Project ID is required" })
        }

        const project = await Project.findByPk(id)

        if (!project) return res.status(404).json({ error: 'Project not found' })

        await project.destroy()

        return res.status(200).json({ message: 'Project deleted' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while fetching the Projects.' })
    }
}

// Update an existing Batch
export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, projects } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            res.status(404).json({ error: 'Project Not Found.' });
            return;
        }

        project.title = title;
        project.description = description;
        project.projects = projects;

        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update project', error: error.message });
    }
};