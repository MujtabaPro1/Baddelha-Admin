import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../service/api';
import DealerDetailsModal from '../components/DealerDetailsModal';

interface Dealer {
  id: number;
  userId: number;
  company: string;
  companyPhone: string;
  licenseNumber: string;
  dealerType: string;
  location: string;
  website: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const Dealers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_approval');
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getDealers();
  }, [page, searchQuery, statusFilter]);

  const getDealers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/1.0/dealer/admin/list', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
          sortOrder: 'desc'
        }
      });
      
      setDealers(response.data.items || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.pages || 0);
    } catch (err) {
      console.error('Error fetching dealers:', err);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    getDealers();
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      <PageHeader 
        title="Dealers" 
        description="Manage all dealers on the Baddelha platform"
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search dealers..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-input pl-10"
          />
        </div>
        <div className="sm:w-64 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Dealers table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  </div>
                </td>
              </tr>
            ) : dealers.length > 0 ? (
              dealers.map((dealer) => (
                <tr key={dealer.id} className="hover:bg-gray-50 animated-transition">
                  <td className="font-medium text-gray-900">{dealer?.user?.firstName} {dealer?.user?.lastName}</td>
                  <td className="font-medium text-gray-900">{dealer?.user?.email || 'N/A'}</td>
                  <td className="font-medium text-gray-900">{dealer.companyRegName || 'N/A'}</td>
                  <td>{dealer.user?.phone || 'N/A'}</td>
                  <td>
                    <span className="capitalize">{dealer.dealerType || 'N/A'}</span>
                  </td>
                  <td>
                    <StatusBadge status={dealer.status as any} />
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => setSelectedDealerId(dealer.userId)}
                      className="text-sm text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className="text-gray-500">No dealers found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Dealer Details Modal */}
      {selectedDealerId && (
        <DealerDetailsModal
          dealerId={selectedDealerId}
          onClose={() => setSelectedDealerId(null)}
          onUpdate={() => {
            getDealers();
            setSelectedDealerId(null);
          }}
        />
      )}
    </div>
  );
};

export default Dealers;