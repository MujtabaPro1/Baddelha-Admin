import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { requestNotificationPermission } from '../service/firebase';
import { showToast } from '../components/NotificationToastContainer';

export const useFirebaseNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
        }

        const token = await requestNotificationPermission();

        if (token) {
          console.log('FCM token issued:', token);
          localStorage.setItem('fcm_token', token);
          localStorage.setItem('notification_permission', 'granted');
          // TODO: Send to backend when API is ready
          // await axiosInstance.post('/1.0/user/fcm-token', { token });
        } else {
          localStorage.removeItem('fcm_token');
          localStorage.setItem(
            'notification_permission',
            Notification.permission === 'denied' ? 'denied' : 'unavailable'
          );
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Set up foreground message listener
    const setupMessageListener = async () => {
      try {
        console.log('[Setup] Initializing foreground message listener...');
        const { onMessage } = await import('firebase/messaging');
        const { initializeFirebase } = await import('../service/firebase');
        const { messaging } = await initializeFirebase();
        
        if (!messaging) {
          console.error('[Setup] Messaging instance is null!');
          return;
        }

        console.log('[Setup] Messaging instance ready, setting up onMessage listener');

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload: any) => {
          console.log('🔔 [Foreground] Message received:', payload);
          console.log('🔔 [Foreground] Notification permission:', Notification.permission);
          console.log('🔔 [Foreground] Document visibility:', document.visibilityState);
          
          const title = payload.notification?.title || payload.data?.title || 'New Notification';
          const body = payload.notification?.body || payload.data?.body || '';
          
          console.log('🔔 [Foreground] Parsed title:', title);
          console.log('🔔 [Foreground] Parsed body:', body);
          
          const notificationLink = payload.data?.link || (payload.data?.inspectionId ? `/inspections/${payload.data.inspectionId}` : undefined);
          
          // Add to notification center
          addNotification({
            title,
            body,
            type: payload.data?.type || 'general',
            referenceId: payload.data?.inspectionId || payload.data?.referenceId,
            link: notificationLink,
          });

          console.log('🔔 [Foreground] Added to notification center');

          // Show toast notification on UI
          showToast({
            title,
            body,
            type: payload.data?.type || 'general',
            link: notificationLink,
          });

          console.log('🔔 [Foreground] Toast notification shown');

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            try {
              console.log('🔔 [Foreground] Creating browser notification...');
              const notification = new Notification(title, {
                body,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: payload.data?.inspectionId || 'notification',
                data: payload.data,
                requireInteraction: false,
                silent: false,
              });

              console.log('🔔 [Foreground] Browser notification created successfully');

              notification.onclick = () => {
                window.focus();
                if (payload.data?.link) {
                  window.location.href = payload.data.link;
                } else if (payload.data?.inspectionId) {
                  window.location.href = `/inspections/${payload.data.inspectionId}`;
                }
                notification.close();
              };

              // Auto-close after 5 seconds
              setTimeout(() => {
                notification.close();
              }, 5000);
            } catch (error) {
              console.error('❌ [Foreground] Error showing notification:', error);
            }
          } else {
            console.warn('⚠️ [Foreground] Notification permission not granted:', Notification.permission);
          }
        });

        console.log('[Setup] Foreground message listener registered successfully');
        
        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('❌ [Setup] Error setting up message listener:', error);
      }
    };

    setupMessageListener();
  }, [addNotification]);

  return null;
};
