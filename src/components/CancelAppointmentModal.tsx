import React, { useState } from 'react';
import { updateTradeInAppointmentStatus, updateCancellationReason } from '../service/tradeInAppointment';
import { toast } from 'react-toastify';

interface CancelAppointmentModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (appointmentId: string, newStatus: string, reason: string) => void;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({ 
  appointmentId, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentId) return;
    
    setIsSubmitting(true);
    try {
      // First update the appointment status
      onStatusUpdate(appointmentId, 'Cancelled',cancelReason.trim());
      setCancelReason('');
      onClose();
    } catch (error) {
      toast.error('Failed to cancel appointment');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Cancel Appointment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-input w-full"
              rows={4}
              placeholder="Please provide a reason for cancellation..."
              disabled={isSubmitting}
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
