import { Bell, RefreshCw, CheckCheck, Car, ClipboardCheck, Calendar, Tag, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { format } from 'date-fns';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'INSPECTION':
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case 'BOOK_APPOINTMENT':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'CAR':
        return <Car className="h-5 w-5 text-purple-500" />;
      case 'AUCTION':
        return <Tag className="h-5 w-5 text-amber-500" />;
      case 'PRICE_REVEAL':
        return <Tag className="h-5 w-5 text-teal-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-900" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Notifications"
        description="View all system notifications"
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                className="btn btn-outline-primary flex items-center"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
              </button>
            )}
            <button
              className="btn btn-outline-primary flex items-center"
              onClick={() => fetchNotifications()}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-900" />
            All Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({unreadCount} unread)
              </span>
            )}
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors ${notification.link ? 'cursor-pointer' : ''} ${notification.read ? '' : 'bg-blue-50'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
