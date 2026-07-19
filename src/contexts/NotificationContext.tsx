import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  findAllNotifications,
  getUnreadNotificationCount,
  markAllNotificationsSeen,
  markNotificationSeen,
  resolveNotificationLink,
} from '../service/notification';
import { NotificationItem, NotificationType } from '../types/notification';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, string> | null;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const toNotification = (n: NotificationItem): Notification => ({
  id: n.id,
  title: n.title,
  body: n.body,
  type: n.type,
  data: n.data,
  link: resolveNotificationLink(n),
  read: n.isSeen,
  createdAt: new Date(n.createdAt),
});

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Locally injected notifications (from a live FCM push) haven't been
  // written to the feed from the client's point of view yet, but the server
  // already wrote them when it dispatched the push — so this is purely an
  // optimistic, instant addition to the list; the next poll reconciles it.
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [list, count] = await Promise.all([
        findAllNotifications({ limit: 100 }),
        getUnreadNotificationCount(),
      ]);
      setNotifications(list.data.map(toNotification));
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (target?.read) return;

    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Locally-injected notifications (id prefixed "local-") haven't been
    // persisted under this id on the server, so there's nothing to PATCH.
    if (id.startsWith('local-')) return;

    try {
      await markNotificationSeen(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsSeen();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Load notifications once logged in, and clear them out on logout.
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Poll for new notifications every 30 seconds while logged in.
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
