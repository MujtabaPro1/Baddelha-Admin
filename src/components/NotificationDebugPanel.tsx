import React, { useState, useEffect } from 'react';
import { Bell, Copy, Check, TestTube } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { showToast } from './NotificationToastContainer';

const NotificationDebugPanel: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const token = localStorage.getItem('fcm_token');
    if (token) {
      setFcmToken(token);
    }
  }, []);

  const copyToken = () => {
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTestNotification = () => {
    const testNotif = {
      title: 'Test Notification',
      body: 'This is a test notification from the debug panel',
      type: 'inspection' as const,
      referenceId: '12345',
      link: '/inspections/12345',
    };
    
    addNotification(testNotif);
    showToast(testNotif);
  };

  if (!fcmToken) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Push Notifications Not Enabled</h3>
            <p className="text-sm text-yellow-700">
              Please allow notifications when prompted to receive real-time updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Push Notifications Enabled</h3>
          </div>
          <div className="bg-white rounded border border-blue-200 p-2 mb-3">
            <p className="text-xs text-gray-600 mb-1 font-medium">FCM Token:</p>
            <p className="text-xs text-gray-800 font-mono break-all">{fcmToken}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToken}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Token
                </>
              )}
            </button>
            <button
              onClick={sendTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <TestTube className="h-4 w-4" />
              Test Notification
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>For Backend:</strong> Use this token to send push notifications to this device.
          Synced automatically via <code className="bg-blue-100 px-1 py-0.5 rounded">POST /1.0/user/update-fcm-token</code>
        </p>
      </div>
    </div>
  );
};

export default NotificationDebugPanel;
