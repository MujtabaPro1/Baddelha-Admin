import { useState, useEffect } from 'react';
import { Bell, RefreshCw, Calendar, User, Info, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import SendNotificationModal from '../components/SendNotificationModal';
import { mockNotifications, MockNotification } from '../mock/notificationsData';

// Using the MockNotification interface from mock data

const Notifications = () => {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Use mock data for testing
      // In production, uncomment the API call below
      // const response = await axiosInstance.get('/1.0/notification/find-all');
      // setNotifications(response.data?.data || []);
      
      // Using mock data
      setTimeout(() => {
        setNotifications([...mockNotifications]);
        setLoading(false);
      }, 600); // Simulate API delay
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-900" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Notifications" 
        description="View all system notifications"
        actions={
          <div className="flex gap-2">
            <button 
              className="btn btn-outline-primary flex items-center"
              onClick={fetchNotifications}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Send className="h-4 w-4 mr-1" /> Send Notification
            </button>
          </div>
        }
      />

      {/* Notifications list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-900" />
            All Notifications
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${notification.isRead ? '' : 'bg-blue-50'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title || 'Notification'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Send Notification Modal */}
      <SendNotificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={fetchNotifications}
      />
    </div>
  );
};

export default Notifications;
