import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, Plus, RefreshCw, Calendar, MapPin, 
  ChevronRight, AlertTriangle, Clock, User, X, UserPlus,
  Eye,
  Loader,
  Check,
  ChevronLeft
} from 'lucide-react';
import { InspectionRequest, User as UserInterface, Car } from '../types';
import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';



interface Inspector {
  id: number;
  name: string;
  email: string;
  phone: string;
  branchId: number;
}

const Inspections = () => {
  const { user } = useAuth();
  const [inspections, setInspections]: any = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchInspections();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/1.0/inspection/find-all?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);

      const data = response?.data?.data?.map((a: any)=>{
        return {
          ...a,
          priority: 'high',
          Branch: {
            enName: a?.BookAppointments[0]?.Branch?.enName || 'Riyadh Tahlia Branch'
          },
          appointmentId: a?.BookAppointments[0]?.uid,
          car: a?.Car
        }
      });
    
      setInspections(data || []);
      const total = response?.data?.totalCount || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  

  



  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };


  return (
    <div>
      <PageHeader 
        title="Inspection Requests" 
        description={user?.role === 'inspector' ? 
          "Manage your assigned inspection requests" : 
          "Manage all inspection requests on the platform"
        }
        actions={
          user?.role === 'admin' && (
            <button className="btn btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-1" /> New Inspection
            </button>
          )
        }
      />
    
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>

      </div>
      
      {/* Inspections list */}
      <div className="space-y-4">
        {inspections.map((inspection: any) => (
          <div 
            key={inspection.uid} 
            className="card p-6 block hover:shadow-md animated-transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
                <div className="mb-4 md:mb-0 md:mr-2">
                  <img
                    src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZD95oZGb_ZQ878HfJtb_LSfxO3tk5Eus0eG79chwbHf3t6lhfDBOyL7s0pedxMx6H2qY&usqp=CAU'}
                    alt={`carImage`}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                </div>
              
                <div>

                  <div className="flex items-center flex-wrap gap">
                    <h3 className="text-lg font-medium text-gray-900">
                      {inspection.car.year} {inspection.car.make} {inspection.car.model}
                    </h3>
                  </div>
                  <div className="text-[10px] font-semibold text-blue-900 mt-1 bg-blue-100 px-2 py-1 mb-2 rounded">
                      Ref: {inspection.id}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                      <StatusBadge status={inspection.inspectionStatus} />
                  </div>
                  
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {inspection.createdAt ? 
                      `Scheduled: ${formatDate(inspection.createdAt)}` :
                      `Requested: ${formatDate(inspection.createdAt)}`
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="truncate max-w-48">{inspection.Branch?.enName}</span>
                </div>
                
                {inspection?.inspectionStatus == 'Submit' ? <div 
                onClick={() => navigate(`/inspections/${inspection.id}`)}
                className="w-full flex items-center justify-center text-center mt-4 cursor-pointer btn-primary text-white px-2 py-1 rounded">
                    <Eye className="mr-1 h-4 w-4"/> Inspection
                 </div> : inspection?.inspectionStatus == 'Completed' ? <div 
                     onClick={() => navigate(`/inspections/${inspection.id}`)}
                 className="w-full flex items-center justify-center text-center mt-4 cursor-pointer bg-green-500 text-white px-2 py-1 rounded">
                    <Check className="mr-1 h-4 w-4"/> Completed
                 </div> : <div className="w-full flex items-center justify-center text-center mt-4 cursor-pointer btn-danger text-white px-2 py-1 rounded">
                    <Loader className="mr-1 h-4 w-4"/> In Progress
                 </div>}
              </div>
            </div>
            
            {inspection.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{inspection.notes}</p>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </div>
            )}
            
           
          </div>
        ))}

        {inspections.length === 0 && !loading && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inspection requests found matching your criteria.</p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-input py-1 px-2 w-20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>of {totalItems} items</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  page === currentPage
                    ? 'bg-blue-900 text-white'
                    : page === '...'
                    ? 'cursor-default'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;