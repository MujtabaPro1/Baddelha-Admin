import React, { useState, useEffect } from 'react';
import { X, FileText, Building2, User, CheckCircle, XCircle, Ban } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-hot-toast';

interface DealerDetailsModalProps {
  dealerId: number;
  onClose: () => void;
  onUpdate: () => void;
}

interface DealerDetails {
  id: number;
  userId: number;
  company: string;
  companyPhone: string;
  licenseNumber: string;
  dealerType: string;
  location: string;
  website: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  };
  media?: any[];
  accountType?: 'company' | 'individual';
  crNumber?: string;
  vatNumber?: string;
  crName?: string;
  idImageUrl?: string;
}

const DealerDetailsModal: React.FC<DealerDetailsModalProps> = ({ dealerId, onClose, onUpdate }) => {
  const [dealer, setDealer] = useState<DealerDetails | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDealerDetails();
  }, [dealerId]);

  const fetchDealerDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/1.0/dealer/admin/detail/${dealerId}`);
      setDealer(response.data.dealer);
      setMedia(response.data.media || []);
    } catch (error) {
      console.error('Error fetching dealer details:', error);
      toast.error('Failed to load dealer details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/1.0/dealer/admin/update-status`, {
        userId: dealerId,
        status: 'active'
      });
      toast.success('Dealer approved successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving dealer:', error);
      toast.error('Failed to approve dealer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this dealer?')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/1.0/dealer/admin/update-status`, {
        userId: dealerId,
        status: 'pending'
      });
      toast.success('Dealer rejected successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting dealer:', error);
      toast.error('Failed to reject dealer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this dealer account?')) return;
    
    setActionLoading(true);
    try {
      await axiosInstance.put(`/1.0/dealer/admin/update-status`, {
        userId: dealerId,
        status: 'rejected'
      });
      toast.success('Dealer deactivated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deactivating dealer:', error);
      toast.error('Failed to deactivate dealer');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return null;
  }

  const isPending = dealer.status?.toLowerCase() === 'pending' || dealer.status?.toLowerCase() === 'pending_approval';
  const isCompany = dealer.dealerType === 'Company';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {isCompany ? (
              <Building2 className="h-6 w-6 text-blue-900 mr-3" />
            ) : (
              <User className="h-6 w-6 text-blue-900 mr-3" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dealer Details</h2>
              <p className="text-sm text-gray-500">
                {isCompany ? 'Company Account' : 'Individual Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                dealer.status?.toLowerCase() === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : dealer.status?.toLowerCase() === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {dealer.status == 'pending_approval' ? 'Pending Approval' : dealer.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Joined: {formatDate(dealer.createdAt)}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{dealer?.user.firstName} {dealer?.user.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{dealer?.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{dealer?.user.phone}</p>
              </div>

            </div>
          </div>

          {/* Company Information */}
          {isCompany && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-900" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Registration Number</label>
                  <p className="text-gray-900 font-mono">{dealer.companyRegNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                  <p className="text-gray-900 font-mono">{dealer.companyVatNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Registration Name</label>
                  <p className="text-gray-900">{dealer.companyRegName || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Individual Information */}
          {!isCompany && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-900" />
                Individual Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National Location</label>
                  <p className="text-gray-900">{dealer.location || 'N/A'}</p>
                </div>
                {dealer.idImageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Document</label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <img
                        src={dealer.idImageUrl}
                        alt="ID Document"
                        className="max-w-full h-auto rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Document+Not+Available';
                        }}
                      />
                      <a
                        href={dealer.idImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Full Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dealer.companyPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
                  <p className="text-gray-900">{dealer.companyPhone}</p>
                </div>
              )}
              {dealer.licenseNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-gray-900 font-mono">{dealer.licenseNumber}</p>
                </div>
              )}
              {dealer.dealerType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Type</label>
                  <p className="text-gray-900 capitalize">{dealer.dealerType}</p>
                </div>
              )}
              {dealer.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{dealer.location}</p>
                </div>
              )}
              {dealer.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <a 
                    href={dealer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {dealer.website}
                  </a>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Status</label>
                <p className="text-gray-900 capitalize">{dealer.user.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(dealer.updatedAt)}</p>
              </div>
            </div>
            
            {media && media.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {media.map((item: any, index: number) => (
                    <div key={index} className="border rounded p-2">
                      <img src={item.url} alt={item.name || `File ${index + 1}`} className="w-full h-auto rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            {isPending ? (
              <>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {dealer.status?.toLowerCase() === 'active' && (
                  <button
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Processing...' : 'Deactivate Account'}
                  </button>
                )}
                  {dealer.status?.toLowerCase() === 'reject' || dealer.status?.toLowerCase() === 'rejected' && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Processing...' : 'Activate Account'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDetailsModal;
