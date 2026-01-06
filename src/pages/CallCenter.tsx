import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Phone, PhoneCall, Calendar, Clock, MapPin, User, Mail, 
  Car as CarIcon, Search, Filter, RefreshCw, CheckCircle, 
  XCircle, AlertCircle, MessageSquare, History, Star,
  LogOut
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../service/api';


// Mock call history
const mockCallHistory = [
  { id: '1', appointmentId: '1', callTime: '2025-04-27T14:30:00Z', duration: '5:23', outcome: 'confirmed', notes: 'Customer confirmed appointment time' },
  { id: '2', appointmentId: '2', callTime: '2025-04-27T10:15:00Z', duration: '3:45', outcome: 'rescheduled', notes: 'Moved to next week due to customer availability' },
  { id: '3', appointmentId: '3', callTime: '2025-04-26T16:20:00Z', duration: '2:10', outcome: 'no_answer', notes: 'Left voicemail' },
];

const CallCenter = () => {
  const [appointments,setAppointments]: any = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [callHistory] = useState(mockCallHistory);
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

    setRescheduleLoading(true);
    try {
      await axiosInstance.post(`/1.0/book-appointment/${showRescheduleModal}/reschedule`, {
        branchId: rescheduleData.branchId,
        appointmentDate: rescheduleData.date,
        appointmentTime: rescheduleData.timeSlot,
        note: rescheduleData.note
      });
      alert('Appointment rescheduled successfully');
      setShowRescheduleModal(null);
      setShowCallModal(null);
      fetchAppointments();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Call Center Portal</h1>
                <p className="text-sm text-gray-600">Manage customer appointments and calls</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user?.name.charAt(0)}</span>
              </div>

              <button
                onClick={()=>{
                  if(confirm("Are you sure you want to logout?")){
                    logout();
                    navigate('/login');
                  }
                }}
                className="flex items-center text-dark"
              >
                <LogOut className="mr-3 h-5 w-5" />
              </button>


            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((a: any) => a.appointmentDate === '2025-04-28').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneCall className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Calls Made Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.filter((a: any) => a.status === 'Confirmed').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Follow-up</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.filter((a: any) => a.status == 'Scheduled').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const priority = getPriorityLevel(appointment);
            const isActive = activeCall === appointment.id;
            
            return (
              <div
                key={appointment.id}
                className={`bg-white rounded-lg shadow border-l-4 ${getPriorityColor(priority)} ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                } transition-all duration-200`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {appointment.firstName + ' ' + appointment.lastName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                        {priority === 'high' && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">{appointment.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{appointment.branch}</span>
                        </div>
                        <div className="flex items-center">
                          <CarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{appointment.car.year} {appointment.car.make} {appointment.car.model}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                      {appointment.status.toLowerCase() == 'scheduled' && <button
                        onClick={() => handleCall(appointment.id, appointment.userDetails.phone)}
                        disabled={isActive}
                        className={`flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                          isActive
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <PhoneCall className="h-4 w-4 mr-2 animate-pulse" />
                            Calling...
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </>
                        )}
                      </button>}
                      
                      <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        SMS
                      </button>
                      
                      <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        <History className="h-4 w-4 mr-2" />
                        History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or date range.</p>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Call in Progress</h3>
              <p className="text-gray-600">
                {appointments.find(a => a.id === showCallModal)?.userDetails.name}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Notes
              </label>
              <textarea
                value={callNotes[showCallModal] || ''}
                onChange={(e) => setCallNotes(prev => ({ ...prev, [showCallModal]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter call notes..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => endCall(showCallModal, 'confirmed')}
                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirmed
              </button>
              <button
                onClick={() => handleReschedule(showCallModal)}
                className="flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Clock className="h-4 w-4 mr-1" />
                Reschedule
              </button>
              <button
                onClick={() => endCall(showCallModal, 'cancelled')}
                className="flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={() => endCall(showCallModal, 'no_answer')}
                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-1" />
                No Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
              <p className="text-gray-600">
                {appointments.find((a: any) => a.id === showRescheduleModal)?.userDetails?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Branch *
                </label>
                <select
                  value={rescheduleData.branchId}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    setRescheduleData(prev => ({ ...prev, branchId, selectedDayIndex: 0, date: '', timeSlot: '' }));
                    if (branchId) fetchBranchTimings(branchId);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Day & Time *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getTimeSlotsForBranch().map((dayData: any, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRescheduleData(prev => ({ ...prev, selectedDayIndex: index, date: dayData.date, timeSlot: '' }))}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            rescheduleData.selectedDayIndex === index && rescheduleData.date === dayData.date
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-center">
                            <div>{dayData.day}</div>
                            <div className="text-xs">{dayData.date}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  {rescheduleData.date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getTimeSlotsForBranch()[rescheduleData.selectedDayIndex]?.slots?.map((slot: any, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setRescheduleData(prev => ({ ...prev, timeSlot: slot.label }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              rescheduleData.timeSlot === slot.label
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={rescheduleData.note}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a note for rescheduling..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                disabled={rescheduleLoading || !rescheduleData.branchId || !rescheduleData.date || !rescheduleData.timeSlot}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCenter;