import React from 'react';

type StatusType =
  | 'active' | 'inactive'
  | 'available' | 'sold' | 'pending' | 'pending_approval'
  | 'scheduled' | 'completed' | 'cancelled'
  | 'approved' | 'confirmed' | 'rejected'
  | 'in_complete' | 'in_progress'
  | 'new' | 'pending_inspection' | 'inspected' | 'listed' | 'unlisted'
  | 'hold' | 'returned' | 'bid_won' | 'closed';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
      case 'completed':
      case 'approved':
      case 'confirmed':
      case 'listed':
      case 'bid_won':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
      case 'in_complete':
      case 'edit':
      case 'returned':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'scheduled':
      case 'in_progress':
      case 'pending_inspection':
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
      case 'inspection':
      case 'inspected':
        return 'bg-blue-100 text-blue-800';
      case 'offer_pending':
      case 'pending_approval':
        return 'bg-purple-100 text-purple-800';
      case 'unlisted':
      case 'closed':
        return 'bg-gray-100 text-gray-600';
      case 'new':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`badge ${getStatusStyles()}`}>
      {label}
    </span>
  );
};

export default StatusBadge;