import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { mockUsers, mockNotifications } from '../mock/notificationsData';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
}

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, onClose, onSend }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use mock data for testing
      // In production, uncomment the API call below
      // const response = await axiosInstance.get('/1.0/user/find-all');
      // setUsers(response.data?.data || []);
      
      // Using mock data
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500); // Simulate API delay
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !body) {
      toast.error('Title and body are required');
      return;
    }
    
    setSending(true);
    try {
      // Use mock data for testing
      // In production, uncomment the API call below
      // await axiosInstance.post('/1.0/notification/send', {
      //   title,
      //   subject,
      //   message: body,
      //   priority,
      //   userId: selectedUserId || undefined // If no user selected, send to all
      // });
      
      // Simulate API call with mock data
      setTimeout(() => {
        // Add the new notification to mock data
        const newNotification = {
          id: (mockNotifications.length + 1).toString(),
          title,
          subject,
          message: body,
          priority: priority as 'low' | 'normal' | 'high',
          createdAt: new Date().toISOString(),
          isRead: false,
          userId: selectedUserId || undefined
        };
        
        mockNotifications.unshift(newNotification);
        
        toast.success('Notification sent successfully');
        resetForm();
        onSend();
        onClose();
        setSending(false);
      }, 800); // Simulate API delay
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setBody('');
    setPriority('normal');
    setSelectedUserId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSend}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input w-full"
              placeholder="Notification title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input w-full"
              placeholder="Notification subject"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="form-input w-full"
              rows={4}
              placeholder="Notification message"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-input w-full"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="form-input w-full"
              disabled={loading}
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName || ''} ({user.email})
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-xs text-gray-500 mt-1">Loading users...</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;
