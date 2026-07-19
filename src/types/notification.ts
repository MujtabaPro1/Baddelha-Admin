export type NotificationType =
  | 'SYSTEM'
  | 'CAR'
  | 'AUCTION'
  | 'INSPECTION'
  | 'PRICE_REVEAL'
  | 'BOOK_APPOINTMENT';

export type DevicePlatform = 'WEB' | 'IOS' | 'ANDROID';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string> | null;
  isSeen: boolean;
  seenAt: string | null;
  createdAt: string;
}

export interface FindAllNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isSeen?: boolean;
}

export interface FindAllNotificationsResponse {
  totalCount: number;
  page: number;
  limit: number;
  data: NotificationItem[];
}

export interface TestNotificationResponse {
  notificationId: string;
  devicesTargeted: number;
  delivered: number;
  failed: number;
}
