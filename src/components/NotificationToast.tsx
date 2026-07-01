import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationToastProps {
  id: string;
  title: string;
  body: string;
  type?: 'inspection' | 'appointment' | 'general' | 'success' | 'error' | 'info';
  link?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  title,
  body,
  type = 'general',
  link,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const handleClick = () => {
    if (link) {
      navigate(link);
      handleClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      case 'inspection':
      case 'appointment':
        return <Bell className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'inspection':
      case 'appointment':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      className={`w-80 sm:w-96 transform transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        onClick={link ? handleClick : undefined}
        className={`
          w-full shadow-lg rounded-lg pointer-events-auto
          border-l-4 ${getTypeColor()}
          ${link ? 'cursor-pointer hover:shadow-xl' : ''}
          transition-shadow duration-200
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{body}</p>
              {link && (
                <p className="mt-2 text-xs text-blue-600 font-medium">
                  Click to view →
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all ease-linear"
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
