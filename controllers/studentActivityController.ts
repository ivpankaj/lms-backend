import { Request, Response } from 'express';
import Activity from '../models/studentActivityModel';
import VideoModel from '../models/videoModel';


export const updateUserActivity = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const { activity } = req.body;

    if (!activity) {
        return res.status(400).json({ message: 'Invalid or missing activity data' });
    }

    try {
        const videos = await VideoModel.findAll({
            where: {
                id: activity.videoId,
                isDeleted: false
            }
        });


        if (videos.length === 0) {
            return res.status(404).json({ message: 'One or more videos not found or deleted' });
        }

        let userActivity = await Activity.findOne({ where: { userId } });

        if (!userActivity) {
            userActivity = await Activity.create({
                userId,
                activity: [activity],
            });
        } else {

            const newData = userActivity.activity.toString();
            const regyts = JSON.parse(newData);
            console.log("Actovity:",regyts, activity);
            regyts.push(activity)

            const existingActivity = JSON.parse(newData || '[]');

            existingActivity.push(activity);

            userActivity.activity = (existingActivity);
            await userActivity.save();


            return res.status(200).json({ message: 'Activity updated successfully', existingActivity: regyts });
        }

        res.status(200).json({ message: 'Activity updated successfully', existingActivity: videos });
    } catch (error) {
        console.error('Error updating user activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get activities by userId
export const getActivitiesByUserId = async (req: Request, res: Response) => {
    const userId = req.body.userId
    const { videoId } = req.params;

    try {
        const activityRecord = await Activity.findOne({ where: { userId } });

        if (!activityRecord) {
            return res.status(404).json({ message: 'Activity not found for this user' });
        }

        const videoActivity = activityRecord.activity.find((act: any) => act.videoId === parseInt(videoId, 10));

        if (!videoActivity) {
            return res.status(404).json({ message: 'Activity for this video not found' });
        }

        return res.status(200).json(videoActivity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Get all activities
export const getAllActivities = async (req: Request, res: Response) => {
    try {
        const activities = await Activity.findAll(); // Get all records from Activity model

        if (activities.length === 0) {
            return res.status(404).json({ message: 'No activities found' });
        }

        return res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching all activities:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Delete an activity by ID
export const deleteActivity = async (req: Request, res: Response) => {
    const userId = req.body.userId
    const { videoId } = req.params;

    try {
        const activityRecord = await Activity.findOne({ where: { userId } });

        if (!activityRecord) {
            return res.status(404).json({ message: 'Activity not found for this user' });
        }

        // Filter out the activity to be deleted
        const updatedActivityList = activityRecord.activity.filter((act: any) => act.videoId !== parseInt(videoId, 10));

        if (updatedActivityList.length === activityRecord.activity.length) {
            return res.status(404).json({ message: 'Activity for this video not found' });
        }

        // Update the activity list without the deleted activity
        activityRecord.activity = updatedActivityList;
        await activityRecord.save();

        return res.status(200).json({
            message: `Activity for video ID ${videoId} deleted successfully`,
            activity: activityRecord.activity,
        });
    } catch (error) {
        console.error('Error deleting activity:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};