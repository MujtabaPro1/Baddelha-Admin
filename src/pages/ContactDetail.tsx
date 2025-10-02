import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, User, ArrowLeft, Calendar, CheckCircle, Archive, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Contact } from '../types/contact';
import { fetchContactById, updateContactStatus } from '../service/contactService';

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyText, setReplyText] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadContact(id);
    }
  }, [id]);

  const loadContact = async (contactId: string) => {
    setLoading(true);
    try {
      const data = await fetchContactById(contactId);
      setContact(data);
      setLoading(false);
      
      // If contact is new, mark it as read
      if (data.status === 'new') {
        await updateContactStatus(contactId, 'read');
        setContact(prev => prev ? { ...prev, status: 'read' } : null);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('Failed to load contact details');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleStatusChange = async (status: Contact['status']) => {
    if (!contact || !id) return;
    
    try {
      await updateContactStatus(id, status);
      setContact({ ...contact, status });
      toast.success(`Contact marked as ${status}`);
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !contact || !id) return;
    
    // In a real implementation, you would send the reply via API
    // For now, we'll just simulate it
    try {
      await updateContactStatus(id, 'replied');
      setContact({ ...contact, status: 'replied' });
      toast.success('Reply sent successfully');
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const getStatusBadge = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">New</span>;
      case 'read':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Read</span>;
      case 'replied':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Replied</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Contact Request Details" 
        description="View and manage contact request"
        actions={
          <button 
            className="btn btn-outline-primary flex items-center"
            onClick={() => navigate('/contacts')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Contacts
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      ) : contact ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Contact Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-900" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">{contact.name}</h2>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" /> {contact.email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" /> {contact.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(contact.status)}
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> {formatDate(contact.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Message */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {contact.subject || 'No Subject'}
              </h3>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {/* Reply Section */}
          <div className="px-6 py-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reply</h3>
            <textarea
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              rows={4}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
                onClick={() => setReplyText('')}
              >
                Clear
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 flex items-center"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                <Send className="h-4 w-4 mr-1" /> Send Reply
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            {contact.status !== 'read' && (
              <button
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-transparent rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                onClick={() => handleStatusChange('read')}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Mark as Read
              </button>
            )}
            {contact.status !== 'archived' && (
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                onClick={() => handleStatusChange('archived')}
              >
                <Archive className="h-4 w-4 mr-1" /> Archive
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Contact not found</p>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;
