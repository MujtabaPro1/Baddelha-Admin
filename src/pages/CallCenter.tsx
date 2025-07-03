import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Phone, PhoneCall, Calendar, Clock, MapPin, User, Mail, 
  Car as CarIcon, Search, Filter, RefreshCw, CheckCircle, 
  XCircle, AlertCircle, MessageSquare, History, Star
} from 'lucide-react';
import { Appointment, User as UserInterface, Car } from '../types';

// Mock data for appointments (same structure as before)
const mockAppointments: (Appointment & { userDetails: UserInterface, carDetails: Car })[] = [
  {
    id: '1',
    userId: '1',
    carId: '3',
    date: '2025-04-28',
    time: '10:00',
    location: 'Baddelha Riyadh Branch',
    purpose: 'buy',
    status: 'scheduled',
    notes: 'Customer interested in test drive and discussing financing options.',
    userDetails: {
      id: '1',
      name: 'Ahmed Mohammed',
      email: 'ahmed@example.com',
      phone: '+966 50 123 4567',
      role: 'customer',
      status: 'active',
      createdAt: '2023-05-15T08:30:00Z'
    },
    carDetails: {
      id: '3',
      make: 'Nissan',
      model: 'Patrol',
      year: 2023,
      price: 235000,
      condition: 'new',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Silver',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '2',
    userId: '2',
    carId: '5',
    date: '2025-04-28',
    time: '14:30',
    location: 'Baddelha Jeddah Branch',
    purpose: 'sell',
    status: 'scheduled',
    notes: 'Customer wants to sell their car. Vehicle inspection required.',
    userDetails: {
      id: '2',
      name: 'Fatima Al-Saud',
      email: 'fatima@example.com',
      phone: '+966 55 987 6543',
      role: 'customer',
      status: 'active',
      createdAt: '2023-07-22T14:45:00Z'
    },
    carDetails: {
      id: '5',
      make: 'Hyundai',
      model: 'Sonata',
      year: 2021,
      price: 85000,
      condition: 'used',
      mileage: 30000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Red',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '3',
    userId: '4',
    carId: '2',
    date: '2025-04-29',
    time: '11:15',
    location: 'Baddelha Dammam Branch',
    purpose: 'tradeIn',
    status: 'scheduled',
    notes: 'Customer interested in trading their current vehicle for a newer model.',
    userDetails: {
      id: '4',
      name: 'Nora Al-Qahtani',
      email: 'nora@example.com',
      phone: '+966 56 234 5678',
      role: 'customer',
      status: 'inactive',
      createdAt: '2023-08-05T09:15:00Z'
    },
    carDetails: {
      id: '2',
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      price: 95000,
      condition: 'used',
      mileage: 25000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Black',
      status: 'sold',
      thumbnailUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '4',
    userId: '5',
    carId: '1',
    date: '2025-04-27',
    time: '15:00',
    location: 'Baddelha Riyadh Branch',
    purpose: 'buy',
    status: 'completed',
    notes: 'Customer purchased the vehicle. All paperwork completed.',
    userDetails: {
      id: '5',
      name: 'Khalid Al-Harbi',
      email: 'khalid@example.com',
      phone: '+966 53 876 5432',
      role: 'dealer',
      status: 'active',
      createdAt: '2023-04-30T16:40:00Z'
    },
    carDetails: {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 110000,
      condition: 'new',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'White',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '5',
    userId: '3',
    carId: '4',
    date: '2025-04-26',
    time: '09:30',
    location: 'Baddelha Jeddah Branch',
    purpose: 'tradeIn',
    status: 'cancelled',
    notes: 'Appointment cancelled by customer. Follow up required.',
    userDetails: {
      id: '3',
      name: 'Mohammed Abdullah',
      email: 'mohammed@example.com',
      phone: '+966 54 456 7890',
      role: 'dealer',
      status: 'active',
      createdAt: '2023-06-10T11:20:00Z'
    },
    carDetails: {
      id: '4',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2020,
      price: 180000,
      condition: 'used',
      mileage: 45000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Blue',
      status: 'pending',
      thumbnailUrl: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
];

// Mock call history
const mockCallHistory = [
  { id: '1', appointmentId: '1', callTime: '2025-04-27T14:30:00Z', duration: '5:23', outcome: 'confirmed', notes: 'Customer confirmed appointment time' },
  { id: '2', appointmentId: '2', callTime: '2025-04-27T10:15:00Z', duration: '3:45', outcome: 'rescheduled', notes: 'Moved to next week due to customer availability' },
  { id: '3', appointmentId: '3', callTime: '2025-04-26T16:20:00Z', duration: '2:10', outcome: 'no_answer', notes: 'Left voicemail' },
];

const CallCenter = () => {
  const [appointments] = useState(mockAppointments);
  const [callHistory] = useState(mockCallHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState<{ [key: string]: string }>({});
  const [showCallModal, setShowCallModal] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((appointment) => {
    const searchStr = `${appointment.userDetails.name} ${appointment.userDetails.phone} ${appointment.carDetails.make} ${appointment.carDetails.model}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === '' || appointment.status === selectedStatus;
    const matchesDate = selectedDate === '' || appointment.date === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const handleCall = (appointmentId: string, phone: string) => {
    setActiveCall(appointmentId);
    // In a real app, this would integrate with a phone system
    window.open(`tel:${phone}`, '_self');
    setShowCallModal(appointmentId);
  };

  const endCall = (appointmentId: string, outcome: string) => {
    setActiveCall(null);
    setShowCallModal(null);
    // Save call record logic here
    console.log('Call ended:', { appointmentId, outcome, notes: callNotes[appointmentId] });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
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
    switch (priority) {
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
                <p className="text-sm font-medium text-gray-900">Call Center Agent</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">CA</span>
              </div>
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
                  {appointments.filter(a => a.date === '2025-04-28').length}
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
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                <p className="text-2xl font-bold text-gray-900">8</p>
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
                <p className="text-2xl font-bold text-gray-900">4</p>
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
                          {appointment.userDetails.name}
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
                          <span className="font-medium">{appointment.userDetails.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(appointment.date)} at {formatTime(appointment.time)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{appointment.location}</span>
                        </div>
                        <div className="flex items-center">
                          <CarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{appointment.carDetails.year} {appointment.carDetails.make} {appointment.carDetails.model}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                      <button
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
                      </button>
                      
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
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => endCall(showCallModal, 'confirmed')}
                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirmed
              </button>
              <button
                onClick={() => endCall(showCallModal, 'rescheduled')}
                className="flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Clock className="h-4 w-4 mr-1" />
                Reschedule
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
    </div>
  );
};

export default CallCenter;