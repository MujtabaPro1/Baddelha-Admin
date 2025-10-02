import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Phone, User, Eye, CheckCircle, Archive } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Contact } from '../types/contact';
import { fetchContacts, updateContactStatus } from '../service/contactService';
import { Link } from 'react-router-dom';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    loadContacts();
  }, [page]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await fetchContacts(page, limit);
      setContacts(response.data);
      setTotal(response.meta?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
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

  const handleStatusChange = async (id: string, status: Contact['status']) => {
    try {
      await updateContactStatus(id, status);
      // Update the local state
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, status } : contact
      ));
      toast.success(`Contact marked as ${status}`);
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
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
        title="Contact Requests" 
        description="Manage customer contact requests"
        actions={
          <button 
            className="btn btn-outline-primary flex items-center"
            onClick={loadContacts}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </button>
        }
      />

      {/* Contacts list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-900" />
            All Contact Requests
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contact requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-900" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {contact.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> {contact.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contact.subject || 'No Subject'}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {contact.message?.substring(0, 60)}
                        {contact.message && contact.message.length > 60 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/contacts/${contact.id}`}
                          className="text-blue-900 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        {contact.status === 'new' && (
                          <button
                            onClick={() => handleStatusChange(contact.id, 'read')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Read"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {contact.status !== 'archived' && (
                          <button
                            onClick={() => handleStatusChange(contact.id, 'archived')}
                            className="text-gray-600 hover:text-gray-900"
                            title="Archive"
                          >
                            <Archive className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > limit && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page * limit >= total ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Page numbers would go here if needed */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * limit >= total}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page * limit >= total ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
