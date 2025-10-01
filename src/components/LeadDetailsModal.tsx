import React from 'react';
import { Lead } from '../types/lead';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClick: (lead: Lead) => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, isOpen, onClose, onUpdateClick }) => {
  if (!isOpen || !lead) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Lead Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
            <p className="text-base">{lead.fullName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-base">{lead.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="text-base">{lead.phone}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date Submitted</h3>
            <p className="text-base">{formatDate(lead.createdAt)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Subject</h3>
            <p className="text-base">{lead.subject}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-base capitalize">{lead.status.replace('-', ' ')}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-base whitespace-pre-wrap">{lead.message}</p>
          </div>
        </div>
        
        {lead.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-base whitespace-pre-wrap">{lead.notes}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
          >
            Close
          </button>
          <button
            onClick={() => onUpdateClick(lead)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
