/**
 * Notification Service
 * Manages notification creation, delivery, and rules engine
 */

import prisma from './prisma';
import { emitToUser } from './socket-server';

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  documentId?: string;
  eventId?: string;
  taskId?: string;
  actions?: any;
}

export interface NotificationAction {
  label: string;
  url: string;
  type: 'primary' | 'secondary';
}

/**
 * Create a notification and emit it via WebSocket
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        documentId: data.documentId,
        eventId: data.eventId,
        taskId: data.taskId,
        actions: data.actions || null,
        isRead: false,
      },
    });

    // Emit real-time notification
    emitToUser(data.userId, 'notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });

    // Emit read status update
    emitToUser(userId, 'notification:read', notificationId);

    return notification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId, userId },
    });

    // Emit deletion event
    emitToUser(userId, 'notification:deleted', notificationId);

    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 50, unreadOnly: boolean = false) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

// ============================================================================
// NOTIFICATION RULES ENGINE
// ============================================================================

/**
 * Check for expiring documents and create notifications
 */
export async function checkExpiringDocuments() {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        endDate: {
          lte: sevenDaysFromNow,
          gte: new Date(),
        },
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            preferences: true,
          },
        },
      },
    });

    for (const doc of expiringDocuments) {
      // Check if notification already exists for this document
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: doc.userId,
          documentId: doc.id,
          type: 'warning',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
      });

      if (!existingNotification) {
        await createNotification({
          userId: doc.userId,
          type: 'warning',
          title: 'Document Expiring Soon',
          message: `Your ${doc.category} document "${doc.title}" will expire on ${doc.endDate?.toLocaleDateString()}.`,
          documentId: doc.id,
          actions: [
            {
              label: 'View Document',
              url: `/documents/${doc.id}`,
              type: 'primary',
            },
            {
              label: 'Renew',
              url: `/documents/${doc.id}/renew`,
              type: 'secondary',
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error('Failed to check expiring documents:', error);
  }
}

/**
 * Check for overdue tasks and create notifications
 */
export async function checkOverdueTasks() {
  try {
    const now = new Date();

    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['pending', 'in_progress'] },
      },
      include: {
        user: {
          select: {
            id: true,
            preferences: true,
          },
        },
      },
    });

    for (const task of overdueTasks) {
      // Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: task.userId,
          taskId: task.id,
          type: 'critical',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!existingNotification) {
        await createNotification({
          userId: task.userId,
          type: 'critical',
          title: 'Task Overdue',
          message: `Task "${task.title}" is overdue. Please complete it as soon as possible.`,
          taskId: task.id,
          actions: [
            {
              label: 'View Task',
              url: `/tasks?taskId=${task.id}`,
              type: 'primary',
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error('Failed to check overdue tasks:', error);
  }
}

/**
 * Check for upcoming events and send reminders
 */
export async function checkUpcomingEvents() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'upcoming',
      },
      include: {
        user: {
          select: {
            id: true,
            preferences: true,
          },
        },
      },
    });

    for (const event of upcomingEvents) {
      // Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: event.userId,
          eventId: event.id,
          type: 'critical',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!existingNotification) {
        await createNotification({
          userId: event.userId,
          type: event.priority === 'critical' ? 'critical' : 'warning',
          title: 'Event Reminder',
          message: `"${event.title}" is scheduled for tomorrow (${event.eventDate.toLocaleDateString()}).`,
          eventId: event.id,
          actions: [
            {
              label: 'View Event',
              url: `/calendar?eventId=${event.id}`,
              type: 'primary',
            },
          ],
        });

        // Emit event reminder
        emitToUser(event.userId, 'event:reminder', {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
        });
      }
    }
  } catch (error) {
    console.error('Failed to check upcoming events:', error);
  }
}

/**
 * Notify about document upload completion
 */
export async function notifyDocumentUploaded(userId: string, documentId: string, documentTitle: string) {
  await createNotification({
    userId,
    type: 'success',
    title: 'Document Uploaded',
    message: `"${documentTitle}" has been successfully uploaded and processed.`,
    documentId,
    actions: [
      {
        label: 'View Document',
        url: `/documents/${documentId}`,
        type: 'primary',
      },
    ],
  });
}

/**
 * Notify about sync completion
 */
export async function notifySyncCompleted(userId: string, connectionType: 'drive' | 'email', filesProcessed: number, success: boolean) {
  await createNotification({
    userId,
    type: success ? 'success' : 'warning',
    title: success ? 'Sync Completed' : 'Sync Completed with Errors',
    message: success
      ? `Successfully synced ${filesProcessed} files from ${connectionType === 'drive' ? 'Google Drive' : 'Email'}.`
      : `Synced ${filesProcessed} files from ${connectionType === 'drive' ? 'Google Drive' : 'Email'} with some errors.`,
    actions: [
      {
        label: 'View Details',
        url: connectionType === 'drive' ? '/integrations/google-drive' : '/integrations/email',
        type: 'primary',
      },
    ],
  });
}

/**
 * Run all notification checks (cron job)
 */
export async function runNotificationChecks() {
  console.log('[Notification Service] Running notification checks...');
  await Promise.all([checkExpiringDocuments(), checkOverdueTasks(), checkUpcomingEvents()]);
  console.log('[Notification Service] Notification checks completed');
}
