import Notification from '../models/Notification.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

// @desc    Get user's notifications with pagination
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const recipientId = req.user._id.toString();

    if (getIsConnected()) {
      const query = { recipientId };

      const total = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: notifications.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: notifications,
      });
    } else {
      const userNotifs = memoryStore.notifications.filter(
        (n) => n.recipientId.toString() === recipientId
      );
      const total = userNotifs.length;
      const paginated = userNotifs.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const recipientId = req.user._id.toString();

    if (getIsConnected()) {
      const unreadCount = await Notification.countDocuments({
        recipientId,
        isRead: false,
      });
      return res.json({
        success: true,
        unreadCount,
      });
    } else {
      const unreadCount = memoryStore.notifications.filter(
        (n) => n.recipientId.toString() === recipientId && !n.isRead
      ).length;
      return res.json({
        success: true,
        unreadCount,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const recipientId = req.user._id.toString();

    if (getIsConnected()) {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      if (notification.recipientId.toString() !== recipientId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
      }

      notification.isRead = true;
      await notification.save();

      return res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } else {
      const notification = memoryStore.notifications.find((n) => n._id === notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      if (notification.recipientId.toString() !== recipientId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
      }

      notification.isRead = true;

      return res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const recipientId = req.user._id.toString();

    if (getIsConnected()) {
      await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else {
      memoryStore.notifications.forEach((n) => {
        if (n.recipientId.toString() === recipientId) {
          n.isRead = true;
        }
      });
      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }
  } catch (error) {
    next(error);
  }
};
