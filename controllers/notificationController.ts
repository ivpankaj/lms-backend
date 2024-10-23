import { Request, Response } from 'express';
import { NotificationTable } from '../models/notificationModel';
import { Op } from 'sequelize';


export const createNotification = async (req: Request, res: Response) => {
  try {
    const { message, batchId } = req.body;
     console.log('thi is cons')
    // Create a new notification
    const notification = await NotificationTable.create({
      message,
      batchId: batchId || null, // Allow batchId to be null
      isDeleted: false
    });

    res.status(201).json({ data : notification, message: 'Notification created successfully'});
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, batchId, isDeleted } = req.body;

    const notification = await NotificationTable.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update the notification
    await notification.update({
      message: message || notification.message,
      batchId: batchId !== undefined ? batchId : notification.batchId,
      isDeleted: isDeleted !== undefined ? isDeleted : notification.isDeleted
    });

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await NotificationTable.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Soft delete the notification
    await notification.update({ isDeleted: true });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await NotificationTable.findByPk(id);

    if (!notification || notification.isDeleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//for admin add update and delete
export const getAllNotificaions = async (req: Request, res: Response) => {
  try {
    const notification = await NotificationTable.findAll({where : {isDeleted : false}})
  
    return res.status(200).send({data :notification, message : 'all notifications fetched'});
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//for students to show students notifications
export const getAllNotificationsForStudents = async (req: Request, res: Response) => {
  try {
    // Extract batchId from request body or query parameters
    const batchId = req.body.batchId || req.query.batchId; // Adjust based on where you are sending batchId

    // Define the query condition
    let queryCondition;
    if (batchId) {
      if (batchId === 'null') {
        // If batchId is 'null', fetch notifications where batchId is null
        queryCondition = {
          [Op.or]: [
            { batchId: null },
            { batchId: batchId }
          ],
          isDeleted: false
        };
      } else {
        // Fetch notifications for the specific batchId and those where batchId is null
        queryCondition = {
          [Op.or]: [
            { batchId: batchId },
            { batchId: null }
          ],
          isDeleted: false
        };
      }
    } else {
      // If no batchId is provided, fetch all notifications where isDeleted is false
      queryCondition = { isDeleted: false };
    }

    // Fetch notifications based on the query condition
    const notifications = await NotificationTable.findAll({
      where: queryCondition
    });

    // Return the fetched notifications
    return res.status(200).send({ data: notifications, message: 'All notifications fetched' });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};