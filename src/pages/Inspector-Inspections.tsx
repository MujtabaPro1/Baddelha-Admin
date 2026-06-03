import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, Plus, RefreshCw, Calendar, MapPin, 
  ChevronRight, AlertTriangle, Clock, User, X, UserPlus,
  Play,
  ChevronLeft
} from 'lucide-react';
import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';
import WalkInAppointmentModal from '../components/WalkInAppointmentModal';
import { toast } from 'react-hot-toast';


interface Inspector {
  id: number;
  name: string;
  email: string;
  phone: string;
  branchId: number;
}

const MyInspections = () => {
  const { user } = useAuth();
  const [inspections, setInspections]: any = useState([]);
  const [appointments, setAppointments]: any = useState([]);
  const [allAppointments, setAllAppointments]: any = useState([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inspections' | 'available'>('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryAvailable, setSearchQueryAvailable] = useState('');
  const [searchType, setSearchType] = useState<'phone' | 'email'>('phone');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [assigningJob, setAssigningJob] = useState<number | null>(null);
  const navigate = useNavigate();
  const [inspectorBranchId, setInspectorBranchId] = useState<number | null>(null);
  const [inspectorId, setInspectorId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
 




  useEffect(() => {
      fetchAvailableJobs();
    }, [currentPage, itemsPerPage, searchQueryAvailable]);




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
  

  // First: fetch inspector info on component mount
  useEffect(() => {
    fetchInspectorInfo();
  }, []);


  const fetchInspectorInfo = async () => {
    try {
      let _user = user;
      if (!_user) {
        const storedUser = localStorage.getItem('baddelha_user');
        if (storedUser) {
          _user = JSON.parse(storedUser);
        }
      }
      const userId = _user?.id;
      if (!userId) {
        console.log("No user ID found");
        return;
      };
      
      const response = await axiosInstance.get(`/1.0/user/find/${userId}`);
      if (response?.data) {
        const inspectorData = response.data.Inspector?.find((inspector: any) => inspector.userId === parseInt(userId) && inspector.branch_id);
        console.log("Inspector data:", inspectorData);
        if (inspectorData) {
          setInspectorBranchId(inspectorData.branch_id);
          setInspectorId(inspectorData.userId);
        }
      }
    } catch (err) {
      console.error('Error fetching inspector info:', err);
    }
  };


  useEffect(() => {
    if (inspectorBranchId && inspectorId) {
      fetchInspections();
      fetchAvailableJobs();
      fetchAppointments();
    }
  }, [inspectorBranchId, inspectorId]);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/1.0/inspection/find-all?search=${searchQuery}`);
      const data = response?.data?.data?.map((r: any) => {
        r['car'] = r['Car'];
        return r;
      });




      const filteredData = data?.filter((inspection: any) => 
        inspection.inspectorId == inspectorId &&
        inspection.Branch?.id === inspectorBranchId
      );
      console.log("filteredData", filteredData);
      setInspections(filteredData || []);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/1.0/inspection/available?page=${currentPage}&limit=${itemsPerPage}&branchId=${inspectorBranchId}&search=${searchQueryAvailable}`);
      const data = response?.data?.data?.map((r: any) => {
        r['car'] = r['Car'];
        return r;
      });

      const filteredData = data?.filter((inspection: any) => 
        inspection.branchId == inspectorBranchId
      );
      const total = response?.data?.totalCount || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
      console.log("filteredData", filteredData);
      setAllAppointments(filteredData || []);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAssignJob = async (bookingId: string, inspectionId: number) => {
    setAssigningJob(inspectionId);
    try {
      await axiosInstance.patch(`/1.0/book-appointment/${bookingId}/self-assign`);
      toast.success('Job assigned successfully');
      // Refresh the available jobs list
      await fetchAvailableJobs();
      // Navigate to inspection report
      navigate(`/customer-checkin/${inspectionId}`);
    } catch (err: any) {
      console.error('Error self-assigning job:', err);
      toast.error(err?.response?.data?.message || 'Failed to assign job');
    } finally {
      setAssigningJob(null);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/1.0/book-appointment');
      const data = response?.data.map((a: any) => {
        return {
          ...a,
          priority: 'high',
          car: JSON.parse(a.carDetail),
        };
      });
        const _appointments = data?.filter((appointment: any) => 
          appointment.inspectorUserId === inspectorId
        );
      

    
      console.log("_appointments", _appointments);
      setAppointments(_appointments || []);

    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  // Filter inspections based on user role
  



  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };



  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setShowWalkInModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Walk In Appointment
          </button>
        }
      />
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'inspections'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inspections ({inspections.length})
            </button>
             <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Jobs ({allAppointments?.length || 0})
            </button>
          </nav>
        </div>
      </div>
      
   
      
      {/* Filters and search */}
      {activeTab == 'appointments' && <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 flex">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'phone' | 'email')}
            className="form-input rounded-r-none border-r-0 w-28 bg-gray-50"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </select>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchType === 'phone' ? 'Search by phone...' : 'Search by email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 rounded-l-none"
            />
          </div>
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
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="sm:w-48 flex">
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>}

      
      {/* Inspections list */}
      <div className="space-y-4">
        {(activeTab === 'appointments' ? appointments : activeTab === 'available' ? allAppointments : inspections)
          .filter((inspection: any) => {
            if (activeTab === 'appointments' && inspection.status !== 'Confirmed') return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.trim().toLowerCase();
            if (searchType === 'phone') {
              const phone = (inspection?.phone || inspection?.BookAppointments?.[0]?.phone || '').toLowerCase();
              return phone.includes(q);
            } else {
              const email = (inspection?.email || inspection?.BookAppointments?.[0]?.email || '').toLowerCase();
              return email.includes(q);
            }
          })
          .map((inspection: any, index: number) => (
          <div 
            key={inspection.uid || inspection.id} 
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
                      {inspection?.car?.year} {inspection?.car?.make} {inspection?.car?.model}&nbsp;
                    </h3>

                  </div>
                  {activeTab === 'inspections' && (
                    <div className="text-[10px] font-semibold text-blue-900 mt-1 bg-blue-100 px-2 py-1 mb-2 rounded">
                      Ref: {inspection.id}
                    </div>
                  )}
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <StatusBadge status={activeTab === 'appointments' ? inspection.status : inspection?.inspectionStatus} />
                  </div>
                  {activeTab === 'appointments' && (
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>{inspection?.firstName + ' ' + inspection?.lastName}</span>
                      <span className="mx-2">•</span>
                      <span>{inspection?.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {activeTab === 'appointments' 
                      ? (inspection?.appointmentDate ? `Scheduled: ${formatDate(inspection.appointmentDate)}` : `Requested: ${formatDate(inspection.appointmentDate)}`)
                      : `Created Date: ${formatDate(inspection.createdAt)}`
                    }
                  </span>
                </div>
                {activeTab === 'appointments' && (
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="truncate max-w-48">{inspection.Branch?.enName}</span>
                  </div>
                )}
                {activeTab === 'appointments' ? (
                  <>
                    {inspection?.Inspection?.inspectionStatus == 'Submit' ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-danger flex items-center"
                      >
                        QA Pending
                      </button>
                    ) : inspection?.Inspection?.inspectionStatus == 'Completed' ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="btn mt-3 text-white min-w-[175px] justify-center btn-sm bg-[#f7cb73] flex items-center"
                      >
                        Offer Pending
                      </button>
                    ) : inspection?.customerCheckIn != null ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/inspection-report/${inspection.inspectionId}`);                      
                   
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                      >
                        Start Inspection
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/customer-checkin/${inspection.inspectionId}`);
                          
                        }}
                        className="btn mt-3 min-w-[175px] btn-sm btn-secondary flex items-center"
                      >
                        Customer Check In
                      </button>
                    )}
                  </>
                ) : activeTab === 'available' ? <>
                  <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelfAssignJob(inspection?.BookAppointments?.[0]?.uid, inspection.id);
                        }}
                        disabled={assigningJob === inspection.id}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                      >
                        {assigningJob === inspection.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          'Start Job'
                        )}
                      </button>
                </>
                : inspection.inspectionStatus == 'Pending' ? 
                  <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/inspection-report/${inspection.id}`);
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                      >
                        Start Inspection
                      </button>:
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
  
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                      >
                         {inspection?.insspectionStatus}
                      </button>
                      }
              </div>
            </div>
            
             
     

          </div>
        ))}


   {activeTab == 'inspections' && inspections.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inspection requests found matching your criteria.</p>
          </div>
        ): <></>}

        {activeTab == 'appointments' && appointments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found matching your criteria.</p>
          </div>
        ): <></>}

     

        {activeTab == 'available' && allAppointments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No available inspections found matching your criteria.</p>
          </div>
        ): <></>}


     {/* Pagination */}
      {activeTab === 'available' && totalPages > 1 && (
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

      {/* Walk In Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={showWalkInModal}
        onClose={() => {
          fetchAppointments();
          fetchInspections();
          fetchAvailableJobs();

          setShowWalkInModal(false)}}
        onSuccess={() => {
          fetchAppointments();
          fetchInspections();
          fetchAvailableJobs();
          toast.success('Walk-in appointment created successfully');
        }}
      />
    </div>
  );
};

export default MyInspections;