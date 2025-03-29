export enum NotificationType {
  TopicNotification = 0,
  UserSpecificNotification = 1,
  ScheduledNotification = 2
}

export enum NotificationTopic {
  General = 'General',
  Representative = 'Representative',
  Administrator = 'Administrator'
}

export interface NotificationRecipient {
  id: number;
  username: string;
  email: string;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  type: number;
  scheduledDate?: Date;
  sentDate?: Date;
  recipients?: NotificationRecipient[];
  createdBy?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  isRead?: boolean;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  scheduledDate?: Date;
  topic?: string;
  targetUserIds?: string[];
  additionalData?: Record<string, string>;
}
