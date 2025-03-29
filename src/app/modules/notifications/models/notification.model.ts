export enum NotificationType {
  General = 'general',
  Administrator = 'administrator',
  Representative = 'representative',
  Custom = 'custom'
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
  type: NotificationType;
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
  recipientIds?: number[];
}
