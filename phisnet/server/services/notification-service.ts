// Create: phisnet/server/services/notification-service.ts
import { db, pool } from '../db';
import { notificationsSchema, notificationPreferencesSchema } from '@shared/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export class NotificationService {
  static async getUserNotifications(userId: number, limit: number = 20, offset: number = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }
  
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
        [userId]
      );
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
  
  static async markAsRead(notificationId: number, userId: number) {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
  
  static async markAllAsRead(userId: number) {
    try {
      const result = await pool.query(
        'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false RETURNING *',
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
  
  static async createNotification(notification: any) {
    try {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, organization_id, type, title, message, priority, action_url, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          notification.userId,
          notification.organizationId,
          notification.type,
          notification.title,
          notification.message,
          notification.priority || 'medium',
          notification.actionUrl,
          JSON.stringify(notification.metadata || {})
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
  
  static async createOrganizationNotification(notification: any) {
    // Create notification for all users in organization
    try {
      const usersResult = await pool.query(
        'SELECT id FROM users WHERE organization_id = $1',
        [notification.organizationId]
      );
      
      const notifications = [];
      for (const user of usersResult.rows) {
        const notif = await this.createNotification({
          ...notification,
          userId: user.id
        });
        notifications.push(notif);
      }
      
      return notifications;
    } catch (error) {
      console.error("Error creating organization notification:", error);
      throw error;
    }
  }
  
  static async updatePreferences(userId: number, preferences: any) {
    try {
      const result = await pool.query(
        `INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, campaign_alerts, security_alerts, system_updates, weekly_reports)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           email_notifications = $2,
           push_notifications = $3,
           campaign_alerts = $4,
           security_alerts = $5,
           system_updates = $6,
           weekly_reports = $7,
           updated_at = NOW()
         RETURNING *`,
        [
          userId,
          preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
          preferences.pushNotifications !== undefined ? preferences.pushNotifications : true,
          preferences.campaignAlerts !== undefined ? preferences.campaignAlerts : true,
          preferences.securityAlerts !== undefined ? preferences.securityAlerts : true,
          preferences.systemUpdates !== undefined ? preferences.systemUpdates : true,
          preferences.weeklyReports !== undefined ? preferences.weeklyReports : true
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  }
  
  static async getPreferences(userId: number) {
    try {
      const result = await pool.query(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        // Return default preferences
        return {
          emailNotifications: true,
          pushNotifications: true,
          campaignAlerts: true,
          securityAlerts: true,
          systemUpdates: true,
          weeklyReports: true
        };
      }
      
      return result.rows[0];
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: number, userId: number) {
    try {
      await pool.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}