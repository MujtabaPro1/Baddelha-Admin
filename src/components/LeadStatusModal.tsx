import React, { useState } from 'react';
import { Lead } from '../types/lead';
import { updateLeadStatus } from '../service/leadService';
import { toast } from 'react-toastify';

interface LeadStatusModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const LeadStatusModal: React.FC<LeadStatusModalProps> = ({ lead, isOpen, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState<Lead['status']>(lead?.status || 'new');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;
    
    setIsSubmitting(true);
    try {
      await updateLeadStatus(lead.id, status, notes);
      toast.success('Lead status updated successfully');
      onStatusUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update lead status');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Lead Status</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead from: {lead.fullName}
            </label>
            <p className="text-sm text-gray-500">{lead.email} • {lead.phoneNumber || lead.phone || '-'}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Lead['status'])}
              className="form-input w-full"
              disabled={isSubmitting}
            >
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input w-full"
              rows={4}
              placeholder="Add notes about this lead..."
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadStatusModal;
