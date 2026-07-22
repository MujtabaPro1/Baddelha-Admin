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
  ChevronLeft,
  XCircle
} from 'lucide-react';
import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';
import WalkInAppointmentModal from '../components/WalkInAppointmentModal';
import NotificationTaskbar from '../components/NotificationTaskbar';
import NotificationDebugPanel from '../components/NotificationDebugPanel';
import { toast } from 'react-hot-toast';
import { findMyOffers } from '../service/priceReveal';


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
  const [offerAppointments, setOfferAppointments]: any = useState([]);
  const [allAppointments, setAllAppointments]: any = useState([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inspections' | 'available' | 'cancelled' | 'offers'>('available');
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
  const [cancelledAppointments, setCancelledAppointments] = useState<any[]>([]);
  const [cancelledPage, setCancelledPage] = useState(1);
  const [cancelledTotalPages, setCancelledTotalPages] = useState(1);
  const [cancelledTotal, setCancelledTotal] = useState(0);
  const [cancelledPerPage, setCancelledPerPage] = useState(20);
  const [cancelledSearch, setCancelledSearch] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInspectionId, setHistoryInspectionId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [myOffers, setMyOffers] = useState<any[]>([]);
 




  useEffect(() => {
    if (inspectorBranchId) {
      fetchAvailableJobs();
    }
  }, [currentPage, itemsPerPage, searchQueryAvailable, inspectorBranchId]);

  useEffect(() => {
    if (activeTab === 'cancelled') {
      fetchCancelledAppointment(cancelledPage, cancelledPerPage, cancelledSearch);
    }
  }, [cancelledPage, cancelledPerPage, cancelledSearch, activeTab]);




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
        fetchCancelledAppointment();
        fetchMyOffers();
    }
  }, [inspectorBranchId, inspectorId]);

  const fetchMyOffers = async () => {
    try {
      const res = await findMyOffers();
      setMyOffers(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error('Error fetching my offers:', err);
    }
  };


  const fetchCancelledAppointment = async (page = cancelledPage, perPage = cancelledPerPage, search = cancelledSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`/1.0/book-appointment/search`, {
        filters: { status: 'Cancelled' },
        search: search.trim() || undefined,
        page,
        limit: perPage,
      });
      const raw = response.data?.data || [];
      const parsed = raw.map((a: any) => ({
        ...a,
        car: (() => { try { return JSON.parse(a.carDetail); } catch { return {}; } })(),
      }));
      setCancelledAppointments(parsed);
      setCancelledTotal(response.data?.meta?.total || 0);
      setCancelledTotalPages(response.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching cancelled appointments:', err);
      setError('Failed to load cancelled appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    if (!inspectorBranchId) {
      console.log("No branch ID, skipping fetchAvailableJobs");
      return;
    }
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


   const handleUnAssignJob = async (inspectionId: number) => {
    try {
      await axiosInstance.patch(`/1.0/book-appointment/${inspectionId}/unassign`);
      toast.success('Job unassigned successfully');
      // Refresh the available jobs list
      await fetchAvailableJobs();
      await fetchInspections();
      await fetchAppointments();
      // Navigate to inspection report
    } catch (err: any) {
      console.error('Error unassigning job:', err);
      toast.error(err?.response?.data?.message || 'Failed to unassign job');
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
          && appointment.status != 'Cancelled'
          && appointment.status != 'Completed'
          && appointment?.Inspection?.inspectionStatus != 'Completed'
        );
        const _offerAppointments = data?.filter((appointment: any) =>
          appointment.inspectorUserId === inspectorId
          && appointment.status != 'Cancelled'
          && appointment?.Inspection?.inspectionStatus == 'Completed'
        );




      setAppointments(_appointments || []);
      setOfferAppointments(_offerAppointments || []);

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


    const handleCancelAppointment = async () => {
      console.log('selectedInspection',selectedInspection);
    if (!selectedInspection || !cancelReason.trim()) return;
    const appointmentId =
      selectedInspection.BookAppointments?.[0]?.id ||
      selectedInspection?.uid;
    if (!appointmentId) {
      toast.error('No appointment found for this inspection');
      return;
    }
    setCancelling(true);
    try {
      await axiosInstance.post(`/1.0/book-appointment/${appointmentId}/cancel`, {
        cancelReason: cancelReason.trim(),
      });
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedInspection(null);
      fetchAppointments();
      fetchInspections();
      fetchAvailableJobs();
      fetchCancelledAppointment();

    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (insp: any) => {
    setSelectedInspection(insp);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openHistoryModal = async (inspectionId: string) => {
    setHistoryInspectionId(inspectionId);
    setHistoryData([]);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(`/1.0/inspection/${inspectionId}/history`);
      setHistoryData(res.data || []);
    } catch (err) {
      console.error('Error fetching inspection history:', err);
    } finally {
      setHistoryLoading(false);
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
      
      {/* Notification Debug Panel */}
      <NotificationDebugPanel />
      
      {/* Notification Taskbar */}
      <NotificationTaskbar />
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
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
              onClick={() => setActiveTab('offers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'offers'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Offers ({offerAppointments.length})
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
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'cancelled'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled ({cancelledTotal})
              </button>
          </nav>
        </div>
      </div>
      
   
      
      {/* Filters and search */}
      {activeTab == 'appointments' || activeTab == 'offers' ? <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
      </div> :  activeTab == 'available' ? <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Jobs..."
              value={searchQueryAvailable}
              onChange={(e) => setSearchQueryAvailable(e.target.value)}
              className="form-input pl-10 rounded-l-none"
            />
          </div>
        </div>


      </div> : activeTab === 'cancelled' ? (
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={cancelledSearch}
              onChange={(e) => { setCancelledSearch(e.target.value); setCancelledPage(1); }}
              className="form-input pl-10"
            />
          </div>
          <button
            onClick={() => fetchCancelledAppointment(1, cancelledPerPage, cancelledSearch)}
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : <></>}

      
      {/* Inspections list */}
      <div className="space-y-4">

        {/* Cancelled appointments */}
        {activeTab === 'cancelled' && cancelledAppointments.map((appt: any) => (
          <div key={appt.uid} className="card p-6 hover:shadow-md animated-transition">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZD95oZGb_ZQ878HfJtb_LSfxO3tk5Eus0eG79chwbHf3t6lhfDBOyL7s0pedxMx6H2qY&usqp=CAU"
                  alt="car"
                  className="h-16 w-24 object-cover rounded-md flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                      {appt.displayId}
                    </span>
                    <StatusBadge status={appt.status} />
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{appt.category}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mt-1">
                    {appt.car?.year} {appt.car?.make} {appt.car?.model}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-600 gap-2">
                    <User className="h-4 w-4" />
                    <span>{appt.firstName} {appt.lastName}</span>
                    <span>•</span>
                    <span>{appt.phone}</span>
                  </div>
                  {appt.cancelReason && (
                    <div className="mt-2 flex items-start gap-1 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Reason: {appt.cancelReason}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 text-sm text-gray-600 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{appt.appointmentDate ? formatDate(appt.appointmentDate) : '-'}</span>
                </div>
                {appt.appointmentTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{appt.appointmentTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{appt.Branch?.enName || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(activeTab !== 'cancelled') && (activeTab === 'appointments' ? appointments : activeTab === 'offers' ? offerAppointments : activeTab === 'available' ? allAppointments : inspections)
          .filter((inspection: any) => {
           // if (activeTab === 'appointments' && (inspection.status !== 'Confirmed' || inspection.status !== 'In_Complete')) return false;
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
                    src={inspection?.coverImage ? 'https://service.baddelha.com.sa/api/1.0/media/' + inspection?.coverImage?.filePath : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZD95oZGb_ZQ878HfJtb_LSfxO3tk5Eus0eG79chwbHf3t6lhfDBOyL7s0pedxMx6H2qY&usqp=CAU'}
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
                    <StatusBadge status={(activeTab === 'appointments' || activeTab === 'offers') ? inspection.status : inspection?.inspectionStatus} />
                  </div>
                  {(activeTab === 'appointments' || activeTab === 'offers') && (
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>{inspection?.firstName + ' ' + inspection?.lastName}</span>
                      {inspection?.customerCheckIn != null && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{inspection?.phone}</span>
                        </>
                      )}
                    </div>
                  )}
                  {activeTab === 'available' && (
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>{inspection?.BookAppointments?.[0]?.firstName} {inspection?.BookAppointments?.[0]?.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {(activeTab === 'appointments' || activeTab === 'offers')
                      ? (inspection?.appointmentDate ? `Scheduled: ${formatDate(inspection.appointmentDate)}` : `Requested: ${formatDate(inspection.appointmentDate)}`)
                      : `Created Date: ${formatDate(inspection.createdAt)}`
                    }
                  </span>
                </div>
                {activeTab === 'available' && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="truncate max-w-48 font-bold">{inspection.displayId}</span>
                  </div>
                )}
                {(activeTab === 'appointments' || activeTab === 'offers') && (
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="truncate max-w-48">{inspection.Branch?.enName}</span>
                  </div>
                )}
                {(activeTab === 'appointments' || activeTab === 'offers') ? (
                  <>
                    {inspection?.Inspection?.inspectionStatus == 'Submit' ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm bg-yellow-500 text-white hover:bg-yellow-600 flex items-center"
                      >
                        QA Pending
                      </button>
                    ) : inspection?.Inspection?.inspectionStatus == 'Completed' ? (
                      myOffers.some((o: any) => o.inspectionId === inspection.inspectionId) ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/my-offers');
                          }}
                          className="btn mt-3 text-white min-w-[175px] justify-center btn-sm bg-green-600 hover:bg-green-700 flex items-center"
                        >
                          Offer Ready
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="btn mt-3 text-white min-w-[175px] justify-center btn-sm bg-purple-600 hover:bg-purple-700 flex items-center"
                        >
                          Offer Pending
                        </button>
                      )
                    ) : inspection?.customerCheckIn != null ? (
                      <>{inspection?.Inspection?.inspectionStatus != 'In_Complete' ? 
                        <>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/inspection-report/${inspection.inspectionId}`);                      
                   
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                      >
                        Start Inspection
                      </button>
                        <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Add cancel inspection logic
                          openCancelModal(inspection)
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-danger flex items-center"
                      >
                        Cancel Inspection
                      </button>
                      </>
                        : <>
                            <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/inspection-report/${inspection.inspectionId}?isEdit=true`);                      
                   
                        }}
                        className="btn mt-3 min-w-[175px] justify-center btn-sm btn-danger flex items-center"
                      >
                        Edit Inspection
                      </button>
                                    <button
                      onClick={(e) => { e.preventDefault(); openHistoryModal(inspection.inspectionId); }}
                      className="btn mt-2 min-w-[175px] justify-center btn-sm flex items-center border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      View History
                    </button>

                        </> }</>
                    ) : (
                      <>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/customer-checkin/${inspection.inspectionId}`);
                          
                        }}
                        className="btn mt-3 min-w-[175px] btn-sm btn-secondary flex items-center"
                      >
                        Customer Check In
                      </button>
                           <button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log(inspection);
                          if(confirm("Are you sure you want to remove this inspection?")) {
                            handleUnAssignJob(inspection.uid);                 
                          }
                   
                        }}
                        className="btn mt-3 min-w-[175px] text-white justify-center btn-sm bg-[#ff6700] flex items-center"
                      >
                        Remove Inspection
                      </button>
                      </>
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
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/inspection-report/${inspection.id}`);
                      }}
                      className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                    >
                      Start Inspection
                    </button>
                  </>
                  :
                  <>
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="btn mt-3 min-w-[175px] justify-center btn-sm btn-primary flex items-center"
                    >
                      {inspection?.inspectionStatus}
                    </button>
                  </>
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

     

        {activeTab == 'offers' && offerAppointments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No offers found matching your criteria.</p>
          </div>
        ): <></>}

        {activeTab == 'available' && allAppointments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No available inspections found matching your criteria.</p>
          </div>
        ): <></>}

        {activeTab == 'cancelled' && cancelledAppointments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No cancelled inspections found matching your criteria.</p>
          </div>
        ): <></>}


     {/* Pagination — Available Jobs */}
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
                    ? 'bg-primary text-white'
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

      {/* Pagination — Cancelled */}
      {activeTab === 'cancelled' && cancelledTotalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={cancelledPerPage}
              onChange={(e) => { setCancelledPerPage(Number(e.target.value)); setCancelledPage(1); }}
              className="form-input py-1 px-2 w-20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>of {cancelledTotal} items</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCancelledPage(p => Math.max(1, p - 1))}
              disabled={cancelledPage === 1}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: cancelledTotalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCancelledPage(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  p === cancelledPage ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCancelledPage(p => Math.min(cancelledTotalPages, p + 1))}
              disabled={cancelledPage === cancelledTotalPages}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Page {cancelledPage} of {cancelledTotalPages}
          </div>
        </div>
      )}

      </div>

   {/* Inspection History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Inspection History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
                </div>
              ) : historyData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No history found for this inspection.</p>
              ) : (
                <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                  {historyData.map((entry: any, idx: number) => (
                    <li key={idx} className="ml-6">
                      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-800">
                          {entry.status || entry.inspectionStatus || 'Status update'}
                        </span>
                        {entry.comment && (
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-1">{entry.comment}</p>
                        )}
                        {entry.createdAt && (
                          <span className="text-xs text-gray-400 mt-0.5">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        )}
                        {(entry.User || entry.createdBy) && (
                          <span className="text-xs text-gray-500">
                            By: {entry.User?.firstName || entry.createdBy}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="flex justify-end p-4 border-t border-gray-100">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

   {/* Cancel Appointment Modal */}
      {showCancelModal && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Cancel Appointment</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Cancel appointment for{' '}
                <span className="font-medium">
                  {selectedInspection.Car?.year} {selectedInspection.Car?.make} {selectedInspection.Car?.model}
                </span>{' '}
                — Ref{' '}
                <span className="font-medium">#{selectedInspection.id}</span>.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                {cancelReason.trim() === '' && (
                  <p className="mt-1 text-xs text-red-500">A cancellation reason is required.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Cancel Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Walk In Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={showWalkInModal}
        type='inspector'
        onClose={() => {
          fetchAppointments();
          fetchInspections();
          fetchAvailableJobs();
          fetchCancelledAppointment();

          setShowWalkInModal(false)}}
        onSuccess={() => {
          fetchAppointments();
          fetchInspections();
          fetchAvailableJobs();
          fetchCancelledAppointment();
          toast.success('Walk-in appointment created successfully');
        }}
      />
    </div>



  );
};

export default MyInspections;