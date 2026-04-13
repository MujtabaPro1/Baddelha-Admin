import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Phone, PhoneCall, Calendar, Clock, MapPin,
  Car as CarIcon, Search, RefreshCw, CheckCircle, 
  XCircle, AlertCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../service/api';



const CallCenter = () => {
  const [appointments,setAppointments]: any = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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
  const navigate = useNavigate();

  const filteredAppointments = appointments.filter((appointment) => {
    const searchStr = `${appointment.userDetails.name} ${appointment.userDetails.phone} ${appointment.carDetails.make} ${appointment.carDetails.model}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === '' || appointment.status === selectedStatus;
    const matchesDate = selectedDate === '' || appointment.date === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });


  useEffect(()=>{
    fetchAppointments();
    fetchBranches();
  },[])

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
      const response = await axiosInstance.get(`/1.0/branch-timing`);
      setBranchTimings(response.data || []);
    } catch (err) {
      console.error('Error fetching branch timings:', err);
      setBranchTimings([]);
    }
  };

  const getTimeSlotsForBranch = () => {
    return branchTimings;
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
        const response = await axiosInstance.get('/1.0/book-appointment');
        
        const data = response.data.map((a: any) => {
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
              createdAt: new Date().toISOString()
            },
            carDetails: {
              ...a.car,
              price: a.car?.carPrice || 0
            }
          };
        });

        setAppointments(data);
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


  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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

    if(outcome == 'confirmed' || outcome == 'cancelled'){
      ///api/1.0/book-appointment/:id/update-status/Confirmed
    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/update-status/${outcome == 'confirmed' ? 'Confirmed' : 'Cancelled'}`).then((res)=>{
      console.log(res);
      alert('Appointment status updated successfully');
      fetchAppointments();
    }).catch((err)=>{
      console.log(err);
      alert('Failed to update appointment status');
    });
    }
  };


  const reConfirmAppointment = (appointmentId: string) => {

    // Save call record logic here

    ///api/1.0/book-appointment/:id/update-status/Confirmed
    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/update-status/Confirmed`).then((res)=>{
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
    axiosInstance.post(`/1.0/book-appointment/${appointmentId}/update-status/Cancelled`).then((res)=>{
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <p className="text-3xl font-bold text-amber-600 mt-1">{appointments.filter((a: any) => a.status === 'Scheduled').length}</p>
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
                <p className="text-3xl font-bold text-emerald-600 mt-1">{appointments.filter((a: any) => a.status === 'Confirmed').length}</p>
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
                <p className="text-3xl font-bold text-red-500 mt-1">{appointments.filter((a: any) => a.status === 'Cancelled').length}</p>
                <p className="text-xs text-slate-500 mt-1">Need follow-up</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            
            <button 
              onClick={fetchAppointments}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
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
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="text-slate-700">{formatDate(appointment.appointmentDate)}</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-blue-600 font-medium">{appointment.appointmentTime}</span>
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
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                      {statusLower === 'scheduled' && (
                        <button
                          onClick={() => handleCall(appointment.id, appointment.userDetails.phone)}
                          disabled={isActive}
                          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all w-full ${
                            isActive
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <PhoneCall className="h-4 w-4 animate-pulse" />
                              Calling...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Confirm
                            </>
                          )}
                        </button>
                      )}

                      {statusLower === 'cancelled' && (
                        <button
                          onClick={() => {
                            if(confirm('Are you sure you want to reconfirm this appointment?')){
                              reConfirmAppointment(appointment.id)
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 text-white hover:bg-slate-700 transition-all w-full"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Reactivate
                        </button>
                      )}

                      {statusLower === 'confirmed' && (
                        <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-700 w-full">
                          <CheckCircle className="h-4 w-4" />
                          Ready
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
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
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => endCall(showCallModal, 'confirmed')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmed
                </button>
                <button
                  onClick={() => handleReschedule(showCallModal)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Reschedule
                </button>
                <button
                  onClick={() => endCall(showCallModal, 'cancelled')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-300 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={() => endCall(showCallModal, 'no_answer')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  No Answer
                </button>
              </div>
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
    </div>
  );
};

export default CallCenter;