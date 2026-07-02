import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Phone, PhoneCall, Calendar, Clock, MapPin,
  Car as CarIcon, Search, RefreshCw, CheckCircle,
  XCircle, AlertCircle, LogOut, Pencil,
  InfoIcon, ClipboardList, ChevronUp, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../service/api';
import WalkInAppointmentModal from '../components/WalkInAppointmentModal';
import toast from 'react-hot-toast';



const CallCenter = () => {
  const [appointments,setAppointments]: any = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState({ scheduled: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const itemsPerPage = 20;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState<{ [key: string]: string }>({});
  const [showCallModal, setShowCallModal] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<string | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchTimings, setBranchTimings] = useState<any[]>([]);
  const [rescheduleData, setRescheduleData] = useState({
    branchId: '',
    selectedDayIndex: 0,
    date: '',
    timeSlot: '',
    note: ''
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const { user, logout } = useAuth();
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    branchId: '',
    selectedDayIndex: -1,
    date: '',
    fullDate: '',
    timeSlot: '',
    note: ''
  });
  const [editBranchTimings, setEditBranchTimings] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [pendingInspections, setPendingInspections] = useState<any[]>([]);
  const [pendingInspectionsLoading, setPendingInspectionsLoading] = useState(false);
  const [isInspectionsPanelOpen, setIsInspectionsPanelOpen] = useState(false);
  const navigate = useNavigate();

  const filteredAppointments = appointments;

  useEffect(()=>{
    fetchBranches();
    fetchPendingInspections();
  },[])

  useEffect(()=>{
    fetchAppointments();
  },[currentPage, selectedStatus, selectedDate])

  useEffect(()=>{
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 400);
    return () => clearTimeout(timer);
  },[searchQuery])

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch');
      const branches = response.data.filter((branch: any) => branch.is_active);
      setBranches(branches);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchBranchTimings = async (branchId?: string) => {
    if (!branchId) return;
    try {
      const response = await axiosInstance.get(`/1.0/branch/schedule/availability/${branchId}`);
      setBranchTimings(response.data || []);
    } catch (err) {
      console.error('Error fetching branch timings:', err);
      setBranchTimings([]);
    }
  };

  const getTimeSlotsForBranch = () => {
    return branchTimings;
  };

  const computeTimingsWithDates = (timings: any[]) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return timings.map((t: any) => {
      const targetIdx = daysOfWeek.indexOf(t.day);
      const daysUntil = (targetIdx - today.getDay() + 7) % 7;
      const d = new Date(today);
      d.setDate(today.getDate() + daysUntil);
      return {
        ...t,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        fullDate: format(d, "yyyy-MM-dd'T'HH:mm:ssXXX")
      };
    });
  };

  const fetchBranchTimingsForEdit = async (branchId: string) => {
    if (!branchId) return;
    try {
      const response = await axiosInstance.get(`/1.0/branch/schedule/availability/${branchId}`);
      setEditBranchTimings(computeTimingsWithDates(response.data || []));
    } catch {
      setEditBranchTimings([]);
    }
  };

  const handleEditOpen = (appointment: any) => {
    const branchId = appointment.Branch?.id?.toString() || '';
    setShowEditModal(appointment.id);
    setEditData({
      firstName: appointment.firstName || '',
      lastName: appointment.lastName || '',
      phone: (appointment.phone || '').replace(/^\+?(966)?/, ''),
      branchId,
      selectedDayIndex: -1,
      date: '',
      fullDate: '',
      timeSlot: '',
      note: ''
    });
    if (branchId) fetchBranchTimingsForEdit(branchId);
  };

  const submitEdit = async () => {
    if (!showEditModal || !editData.branchId || !editData.fullDate || !editData.timeSlot) {
      toast.error('Please fill all required fields');
      return;
    }
    setEditLoading(true);
    try {
      await Promise.all([
        axiosInstance.patch(`/1.0/book-appointment/reschedule/${showEditModal}`, {
          branchId: Number(editData.branchId),
          appointmentDate: editData.fullDate,
          appointmentTime: editData.timeSlot,
          remarks: editData.note,
        }),
        axiosInstance.patch(`/1.0/book-appointment/${showEditModal}`, {
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: '+966' + editData.phone.replace(/^\+?(966)?/, ''),
        }),
      ]);
      toast.success('Appointment updated successfully');
      setShowEditModal(null);
      fetchAppointments();
    } catch {
      toast.error('Failed to update appointment');
    } finally {
      setEditLoading(false);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    setShowRescheduleModal(appointmentId);
    setRescheduleData({
      branchId: '',
      selectedDayIndex: 0,
      date: '',
      timeSlot: '',
      note: ''
    });
  };

  const submitReschedule = async () => {
    if (!showRescheduleModal || !rescheduleData.branchId || !rescheduleData.date || !rescheduleData.timeSlot) {
      alert('Please fill all required fields');
      return;
    }

    const appointmentDate = (() => {
      const d = new Date(rescheduleData.date);
      return Number.isNaN(d.getTime())
        ? rescheduleData.date
        : format(d, "yyyy-MM-dd'T'HH:mm:ssXXX");
    })();

    setRescheduleLoading(true);
    try {
      await axiosInstance.patch(`/1.0/book-appointment/reschedule/${showRescheduleModal}`, {
        branchId: Number(rescheduleData.branchId),
        appointmentDate,
        appointmentTime: rescheduleData.timeSlot,
        remarks: rescheduleData.note,
      });
      alert('Appointment rescheduled successfully');
      setShowRescheduleModal(null);
      setShowCallModal(null);
      fetchAppointments();
      setActiveCall(null);
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      alert('Failed to reschedule appointment');
    } finally {
      setRescheduleLoading(false);
    }
  }

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Make the actual API call
      try {
        const filters: any = {};
        if (selectedStatus) {
          filters.status = selectedStatus;
        }
        if (selectedDate) {
          filters.appointmentDate = selectedDate;
        }
        const response = await axiosInstance.post('/1.0/book-appointment/search', {
          search: searchQuery,
          pagination: {
            page: currentPage,
            limit: itemsPerPage
          },
          filters,
          sortOrder: 'desc'
        });
        
        const data = response?.data?.data.map((a: any) => {
          return {
            ...a,
            car: JSON.parse(a.carDetail),
            // Map to expected structure for the call center
            id: a.uid,
            date: a.appointmentDate,
            time: a.appointmentTime,
            location: a.branch?.enName, // Default location if not provided
            purpose: a?.type?.[0]?.toString().toUpperCase() + a?.type?.slice(1)?.toString(),  // Default purpose if not provided
            status: a?.status, // Default status if not provided
            branch: a?.Branch?.enName,
            userDetails: {
              id: a.uid,
              name: a.firstName + ' ' + a.lastName,
              email: a.email,
              phone: '+966 ' + a.phone,
              role: 'customer',
              status: 'active',
              createdAt: a.createdAt || new Date().toISOString()
            },
            carDetails: {
              ...a.car,
              price: a.car?.carPrice || 0
            }
          };
        });
        console.log(data);
        setAppointments(data);
        const total = response.data?.meta?.total || response.data?.length || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        if (response.data?.statistics) {
          setStatistics(response.data.statistics);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError; // Re-throw to be caught by the outer try/catch
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInspections = async () => {
    setPendingInspectionsLoading(true);
    try {
      const response = await axiosInstance.post('/1.0/inspection/search', {
        page: 1,
        limit: 50,
        inspectionStatus: 'Pending'
      });
      const data = response?.data?.data?.map((a: any) => ({
        ...a,
        car: a?.Car,
        branchName: a?.BookAppointments?.[0]?.Branch?.enName || a?.Car?.Branch?.enName || 'N/A'
      })) || [];
      setPendingInspections(data);
    } catch (err) {
      console.error('Error fetching pending inspections:', err);
    } finally {
      setPendingInspectionsLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy hh:mm:ss a');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    if (timeString.includes('T')) {
      try {
        return format(new Date(timeString), 'h:mm a');
      } catch {
        return timeString;
      }
    }
    return timeString;
  };

  const handleCall = (appointmentId: string, phone: string) => {
    setActiveCall(appointmentId);
    // In a real app, this would integrate with a phone system
   // window.open(`tel:${phone}`, '_self');
    setShowCallModal(appointmentId);
  };

  const endCall = (appointmentId: string, outcome: string) => {
    setActiveCall(null);
    setShowCallModal(null);
    setCallNotes({});
    // Save call record logic here

   // if(outcome == 'confirmed' || outcome == 'cancelled'){
      ///api/1.0/book-appointment/:id/update-status/Confirmed
    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/update-status/${outcome}`).then((res)=>{
      console.log(res);
      alert('Appointment status updated successfully');
      fetchAppointments();
    }).catch((err)=>{
      console.log(err);
      alert('Failed to update appointment status');
    });
   // }
  };


  const reConfirmAppointment = (appointmentId: string) => {

    // Save call record logic here

    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/confirm`).then((res)=>{
      console.log(res);
      alert('Appointment status updated successfully');
      fetchAppointments();
    }).catch((err)=>{
      console.log(err);
      alert('Failed to update appointment status');
    });
  }
  


    const cancelAppointment = (appointmentId: string) => {

    // Save call record logic here

    ///api/1.0/book-appointment/:id/update-status/Confirmed
    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/cancel`).then((res)=>{
      console.log(res);
      alert('Appointment status updated successfully');
      fetchAppointments();
    }).catch((err)=>{
      console.log(err);
      alert('Failed to update appointment status');
    });
  }
  



  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityLevel = (appointment: any) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'high';
    if (diffDays <= 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Call Center</h1>
                <p className="text-xs text-slate-500">Manage appointments & calls</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-emerald-600 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={()=>{
                  if(confirm("Are you sure you want to logout?")){
                    logout();
                    navigate('/login');
                  }
                }}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {appointments.filter((a: any) => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.appointmentDate?.split('T')[0] === today;
                  }).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Appointments</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Scheduled</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{statistics.scheduled}</p>
                <p className="text-xs text-slate-500 mt-1">Pending calls</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Confirmed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{statistics.confirmed}</p>
                <p className="text-xs text-slate-500 mt-1">Ready to go</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cancelled</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{statistics.cancelled}</p>
                <p className="text-xs text-slate-500 mt-1">Need follow-up</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{statistics.completed}</p>
                <p className="text-xs text-slate-500 mt-1">Closed out</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: search, date, create */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, phone, or car..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-3 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2"
              >
                Clear date
              </button>
            )}
            <button
              onClick={() => fetchAppointments()}
              className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/30"
            >
              <Phone className="h-4 w-4" />
              Create Appointment
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStatusChange('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === ''
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange('Scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'Scheduled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => handleStatusChange('Confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'Confirmed'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => handleStatusChange('Cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'Cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => handleStatusChange('No_Answer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'No_Answer'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              No Answer
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const priority = getPriorityLevel(appointment);
            const isActive = activeCall === appointment.id;
            const statusLower = appointment.status?.toLowerCase();
            
            return (
              <div
                key={appointment.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'border-slate-100'
                }`}
              >
                <div className={`h-1 ${
                  statusLower === 'confirmed' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                  statusLower === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                  priority === 'high' ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                  'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}></div>
                
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-slate-800">
                          {appointment.firstName} {appointment.lastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          statusLower === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          statusLower === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </span>
                        {priority === 'high' && statusLower === 'scheduled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 animate-pulse">
                            <AlertCircle className="h-3 w-3" />
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="text-slate-700 font-medium">{appointment.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-medium">Appointment</span>
                            <span className="text-slate-800 font-semibold">{formatDate(appointment.appointmentDate)}</span>
                            <span className="text-slate-600 text-xs">{formatTime(appointment.appointmentTime)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="text-slate-700 truncate">{appointment.branch || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CarIcon className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="text-slate-700">{appointment.car?.year} {appointment.car?.make} {appointment.car?.model}</span>
                        </div>
                        {appointment.createdAt && (
                          <div className="flex items-center gap-2 text-sm">
                            Created: <span className="text-slate-500 text-xs"> {formatDate(appointment.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                      {appointment.displayId && (
                        <span className="text-xs text-slate-400 font-medium lg:text-right">
                          #{appointment.displayId}
                        </span>
                      )}

                      {/* Call for Scheduled */}
                      {statusLower === 'scheduled' && (
                        <button
                          onClick={() => handleCall(appointment.id, appointment.phone)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all w-full"
                        >
                          <PhoneCall className="h-4 w-4" />
                          Call
                        </button>
                      )}

                      {/* Confirm for Scheduled */}
                      {statusLower === 'scheduled' && (
                        <button
                          onClick={() => {
                            if (confirm('Confirm this appointment?')) reConfirmAppointment(appointment.id);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all w-full"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                      )}

                      {(statusLower === 'scheduled' || statusLower === 'confirmed') && (
                        <button
                          onClick={() => {
                            if (confirm('Cancel this appointment?')) cancelAppointment(appointment.id);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all w-full"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </button>
                      )}

                      {/* Edit — always visible except cancelled */}
                      {statusLower != 'cancelled' && (
                        <button
                          onClick={() => handleEditOpen(appointment)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all w-full"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-6 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <PhoneCall className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Appointment</h3>
              <p className="text-emerald-100 mt-1">
                {appointments.find((a: any) => a.id === showCallModal)?.userDetails?.name}
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Call Notes
                </label>
                <textarea
                  value={callNotes[showCallModal] || ''}
                  onChange={(e) => setCallNotes(prev => ({ ...prev, [showCallModal]: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Add notes about this call..."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => reConfirmAppointment(showCallModal)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmed
                </button>
                {/* <button
                  onClick={() =>{
                     if(confirm('Are you sure you want to mark this call as no answer?')){
                        endCall(showCallModal, 'no_answer');
                     }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
                >
                  <InfoIcon className="h-4 w-4" />
                  No Answer
                </button> */}
              </div>
              <button
                onClick={() =>{
                  setShowCallModal(null);
                }}
                className="flex w-full mt-4 items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-300 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center sticky top-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Reschedule Appointment</h3>
              <p className="text-amber-100 mt-1">
                {appointments.find((a: any) => a.id === showRescheduleModal)?.userDetails?.name}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Branch *
                </label>
                <select
                  value={rescheduleData.branchId}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    setRescheduleData(prev => ({ ...prev, branchId, selectedDayIndex: 0, date: '', timeSlot: '' }));
                    if (branchId) fetchBranchTimings(branchId);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch: any) => (
                    <option key={branch.id || branch.uid} value={branch.id || branch.uid}>
                      {branch.enName || branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Time Selection */}
              {rescheduleData.branchId && getTimeSlotsForBranch().length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Day *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getTimeSlotsForBranch().map((dayData: any, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRescheduleData(prev => ({ ...prev, selectedDayIndex: index, date: dayData.date, timeSlot: '' }))}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            rescheduleData.selectedDayIndex === index && rescheduleData.date === dayData.date
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{dayData.day}</div>
                            <div className="text-xs opacity-80">{dayData.date}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  {rescheduleData.date && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select Time *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getTimeSlotsForBranch()[rescheduleData.selectedDayIndex]?.slots?.map((slot: any, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setRescheduleData(prev => ({ ...prev, timeSlot: slot.label }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              rescheduleData.timeSlot === slot.label
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Note Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={rescheduleData.note}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                  placeholder="Add a note for rescheduling..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRescheduleModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReschedule}
                  disabled={rescheduleLoading || !rescheduleData.branchId || !rescheduleData.date || !rescheduleData.timeSlot}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {rescheduleLoading ? 'Rescheduling...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


  {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center sticky top-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Pencil className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Edit Appointment</h3>
              <p className="text-blue-100 mt-1 text-sm">
                {appointments.find((a: any) => a.id === showEditModal)?.firstName}{' '}
                {appointments.find((a: any) => a.id === showEditModal)?.lastName}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-slate-200 rounded-l-xl text-sm text-slate-600 font-medium">+966</span>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-slate-50 border-0 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="5xxxxxxxx"
                    maxLength={9}
                  />
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Branch *</label>
                <select
                  value={editData.branchId}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    setEditData(prev => ({ ...prev, branchId, selectedDayIndex: -1, date: '', fullDate: '', timeSlot: '' }));
                    if (branchId) fetchBranchTimingsForEdit(branchId);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch: any) => (
                    <option key={branch.id || branch.uid} value={branch.id || branch.uid}>
                      {branch.enName || branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              {editData.branchId && editBranchTimings.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Day *</label>
                  <div className="flex flex-wrap gap-2">
                    {editBranchTimings.map((t: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditData(prev => ({ ...prev, selectedDayIndex: idx, fullDate: t.fullDate, date: t.displayDate, timeSlot: '' }))}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-center ${
                          editData.selectedDayIndex === idx
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{t.day}</div>
                        <div className="text-xs opacity-80">{t.displayDate}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Slot Selection */}
              {editData.selectedDayIndex >= 0 && editBranchTimings[editData.selectedDayIndex]?.slots?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time *</label>
                  <div className="flex flex-wrap gap-2">
                    {editBranchTimings[editData.selectedDayIndex].slots.map((slot: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditData(prev => ({ ...prev, timeSlot: slot.label }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          editData.timeSlot === slot.label
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Note (Optional)</label>
                <textarea
                  value={editData.note}
                  onChange={(e) => setEditData(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  disabled={editLoading || !editData.branchId || !editData.fullDate || !editData.timeSlot}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Walk In Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={showWalkInModal}
        type={'call-center'}
        onClose={() => {
          fetchAppointments();
          setShowWalkInModal(false)}}
        onSuccess={() => {
          fetchAppointments();
        }}
      />

      {/* Pending Inspections Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setIsInspectionsPanelOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Pending Inspections</p>
              <p className="text-xs text-slate-500">
                {pendingInspectionsLoading ? 'Loading...' : `${pendingInspections.length} awaiting inspection`}
              </p>
            </div>
            {pendingInspections.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {pendingInspections.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); fetchPendingInspections(); }}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${pendingInspectionsLoading ? 'animate-spin' : ''}`} />
            </span>
            {isInspectionsPanelOpen ? (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            )}
          </div>
        </button>

        {isInspectionsPanelOpen && (
          <div className="border-t border-slate-100 max-h-[45vh] overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
            {pendingInspections.length === 0 && !pendingInspectionsLoading && (
              <div className="text-center py-8 text-sm text-slate-500">
                No pending inspections right now.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingInspections.map((inspection: any) => (
                <div
                  key={inspection.uid || inspection.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <CarIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {inspection.car?.year} {inspection.car?.make} {inspection.car?.model}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{inspection.branchName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {inspection.displayId && (
                        <span className="text-[10px] font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                          {inspection.displayId}
                        </span>
                      )}
                      {inspection.createdAt && (
                        <span className="text-[10px] text-slate-400">{formatDate(inspection.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>


  );
};

export default CallCenter;