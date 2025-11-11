import React from 'react';

interface StatusUpdateConfirmationModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentId: string, newStatus: string) => void;
  status: string;
  isSubmitting: boolean;
}

const StatusUpdateConfirmationModal: React.FC<StatusUpdateConfirmationModalProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onConfirm,
  status,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'Confirmed':
        return {
          title: 'Confirm Appointment',
          message: 'Are you sure you want to confirm this appointment?',
          buttonText: 'Confirm',
          buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'Completed':
        return {
          title: 'Complete Appointment',
          message: 'Are you sure you want to mark this appointment as completed?',
          buttonText: 'Complete',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      case 'Cancelled':
        return {
          title: 'Cancel Appointment',
          message: 'Are you sure you want to cancel this appointment?',
          buttonText: 'Cancel',
          buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      default:
        return {
          title: 'Update Status',
          message: 'Are you sure you want to update the status?',
          buttonText: 'Update',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleConfirm = () => {
    onConfirm(appointmentId, status);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{statusInfo.title}</h2>
        
        <p className="mb-6 text-gray-700">{statusInfo.message}</p>
        
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
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white ${statusInfo.buttonClass} border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : statusInfo.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateConfirmationModal;
