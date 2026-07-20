import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationTaskbarProps {
  className?: string;
}

const NotificationTaskbar: React.FC<NotificationTaskbarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSPECTION':
        return 'bg-blue-500';
      case 'BOOK_APPOINTMENT':
        return 'bg-green-500';
      case 'AUCTION':
        return 'bg-amber-500';
      case 'CAR':
        return 'bg-purple-500';
      case 'PRICE_REVEAL':
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INSPECTION':
        return 'Inspection';
      case 'BOOK_APPOINTMENT':
        return 'Appointment';
      case 'AUCTION':
        return 'Auction';
      case 'CAR':
        return 'Car';
      case 'PRICE_REVEAL':
        return 'Price Reveal';
      default:
        return 'General';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({unreadCount} unread)
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Notification List */}
      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-white hover:bg-slate-50' 
                  : 'bg-blue-50/50 hover:bg-blue-50'
              }`}
            >
              {/* Type indicator */}
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getTypeColor(notification.type)}`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    notification.type === 'INSPECTION'
                      ? 'bg-blue-100 text-blue-700'
                      : notification.type === 'BOOK_APPOINTMENT'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {getTypeLabel(notification.type)}
                  </span>
                  {!notification.read && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {notification.body}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {notification.link && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      View details <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center gap-1">
                {!notification.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Show more/less button */}
          {notifications.length > 5 && (
            <div className="px-4 py-2 bg-slate-50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center"
              >
                {showAll ? 'Show less' : `Show all (${notifications.length} notifications)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationTaskbar;
