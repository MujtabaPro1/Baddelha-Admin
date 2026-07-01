import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axiosInstance from '../service/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  body: string;
  // 'general' is visible to every role. Any other type is only shown to a
  // matching user role (e.g. type: 'qa' -> only the qa role sees it), except
  // admin which always sees every notification regardless of type.
  type: 'inspection' | 'appointment' | 'general' | 'inspector' | 'qa' | 'sale' | 'supervisor' | 'call-center';
  referenceId?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
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
  const [allNotifications, setNotifications] = useState<Notification[]>([]);

  // Admin sees every notification. Other roles only see notifications meant
  // for everyone ('general') or specifically targeted at their own role.
  const notifications = user?.role === 'admin'
    ? allNotifications
    : allNotifications.filter(n => n.type === 'general' || n.type === user?.role);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('admin_notifications');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('admin_notifications', JSON.stringify([newNotification, ...existing].slice(0, 50)));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Update localStorage
    const stored = localStorage.getItem('admin_notifications');
    if (stored) {
      const existing = JSON.parse(stored);
      const updated = existing.map((n: Notification) => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const stored = localStorage.getItem('admin_notifications');
    if (stored) {
      const existing = JSON.parse(stored);
      const updated = existing.map((n: Notification) => ({ ...n, read: true }));
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      // Try to fetch from API
      //const response = await axiosInstance.get('/1.0/notifications');
      // if (response.data?.data) {
      //   const apiNotifications = response.data.data.map((n: any) => ({
      //     id: n.id?.toString() || Date.now().toString(),
      //     title: n.title || 'Notification',
      //     body: n.body || n.message || '',
      //     type: n.type || 'general',
      //     referenceId: n.referenceId || n.inspectionId,
      //     link: n.link || (n.inspectionId ? `/inspections/${n.inspectionId}` : undefined),
      //     read: n.read || false,
      //     createdAt: new Date(n.createdAt || Date.now()),
      //   }));
        setNotifications([]);
    
    } catch (error) {
      // If API fails, load from localStorage
      const stored = localStorage.getItem('admin_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })));
      }
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
