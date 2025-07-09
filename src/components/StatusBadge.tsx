import React from 'react';

type StatusType = 
  | 'active' | 'inactive'
  | 'available' | 'sold' | 'pending'
  | 'scheduled' | 'completed' | 'cancelled'
  | 'approved' | 'confirmed' | 'rejected';

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
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`badge ${getStatusStyles()} capitalize`}>
      {status}
    </span>
  );
};

export default StatusBadge;