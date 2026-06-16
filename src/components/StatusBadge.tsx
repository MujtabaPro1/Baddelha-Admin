import React from 'react';

type StatusType = 
  | 'active' | 'inactive'
  | 'available' | 'sold' | 'pending' | 'pending_approval'
  | 'scheduled' | 'completed' | 'cancelled'
  | 'approved' | 'confirmed' | 'rejected'
  | 'in_complete' | 'in_progress';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    console.log(status);
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
      case 'completed':
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
      case 'in_complete':
      case 'edit':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'scheduled':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
      case 'inspection':
        return 'bg-blue-100 text-blue-800';
      case 'offer_pending':
      case 'pending_approval':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`badge ${getStatusStyles()} capitalize`}>
      {status === 'pending_approval' ? 'Pending Approval' 
        : status.toLowerCase() === 'in_complete' ? 'In Complete' 
        : status.toLowerCase() === 'in_progress' ? 'In Progress' 
        : status.toLowerCase() === 'offer_pending' ? 'Offer Pending'
        : status}
    </span>
  );
};

export default StatusBadge;