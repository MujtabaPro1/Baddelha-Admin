import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Copy, Check } from 'lucide-react';

const NotificationDebugPanel: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [copied, setCopied] = useState(false);

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

  if (!fcmToken) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <BellOff className="h-4 w-4" />
        Notifications disabled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Bell className="h-4 w-4 text-blue-600" />
      <span>Notifications enabled</span>
      <button
        onClick={copyToken}
        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy Token
          </>
        )}
      </button>
    </div>
  );
};

export default NotificationDebugPanel;
