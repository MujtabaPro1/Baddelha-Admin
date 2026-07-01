import React, { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type?: 'inspection' | 'appointment' | 'general' | 'success' | 'error' | 'info';
  link?: string;
}

let addToastCallback: ((toast: Omit<ToastNotification, 'id'>) => void) | null = null;

export const showToast = (toast: Omit<ToastNotification, 'id'>) => {
  if (addToastCallback) {
    addToastCallback(toast);
  }
};

const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    addToastCallback = (toast: Omit<ToastNotification, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          body={toast.body}
          type={toast.type}
          link={toast.link}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default NotificationToastContainer;
