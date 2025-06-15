import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, Car as CarIcon, 
  ArrowLeft, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Appointment, User as UserInterface, Car } from '../types';

// Mock data for appointments (same as in Appointments.tsx)
const mockAppointments: (Appointment & { userDetails: User, carDetails: Car })[] = [
  {
    id: '1',
    userId: '1',
    carId: '3',
    date: '2025-04-28',
    time: '10:00',
    location: 'Baddelha Riyadh Branch',
    purpose: 'buy',
    status: 'scheduled',
    notes: 'Customer interested in test drive and discussing financing options. They have been pre-approved for a loan.',
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
    notes: 'Customer wants to sell their car. Vehicle inspection required. Please prepare valuation documents.',
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
    notes: 'Customer interested in trading their current vehicle for a newer model. Bring trade-in value calculator.',
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
    notes: 'Customer purchased the vehicle. All paperwork completed. Vehicle delivery scheduled.',
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
    notes: 'Appointment cancelled by customer. Follow up to reschedule.',
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

const AppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<(Appointment & { userDetails: UserInterface, carDetails: Car }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundAppointment = mockAppointments.find(a => a.id === id) || null;
      setAppointment(foundAppointment);
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Appointment not found</h2>
        <p className="mt-2 text-gray-600">
          The appointment you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link to="/appointments" className="btn btn-primary">
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (appointment.status) {
      case 'scheduled':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link 
          to="/appointments" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Appointments
        </Link>
      </div>
      
      <PageHeader 
        title={`Appointment #${appointment.id}`} 
        actions={
          <div className="flex space-x-3">
            <button className="btn btn-secondary">Edit</button>
            {appointment.status === 'scheduled' && (
              <>
                <button className="btn btn-primary">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete
                </button>
                <button className="btn btn-danger">
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </button>
              </>
            )}
          </div>
        }
      />
      
      {/* Status Banner */}
      <div className={`p-4 rounded-md mb-8 flex items-center ${
        appointment.status === 'scheduled' ? 'bg-yellow-100' : 
        appointment.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {getStatusIcon()}
        <span className={`ml-2 font-medium ${
          appointment.status === 'scheduled' ? 'text-yellow-800' : 
          appointment.status === 'completed' ? 'text-green-800' : 'text-red-800'
        }`}>
          This appointment is {appointment.status}
        </span>
        <div className="ml-auto">
          <StatusBadge status={appointment.status} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointment Details */}
        <div className="card p-6 md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(appointment.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{appointment.location}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Purpose</p>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium capitalize text-sm">
                {appointment.purpose}
              </div>
            </div>
            
            {appointment.notes && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Information */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{appointment.userDetails.name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{appointment.userDetails.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{appointment.userDetails.email}</p>
              </div>
            </div>
          </div>
          
          <button className="btn btn-secondary w-full mt-6">
            View Customer Profile
          </button>
        </div>
        
        {/* Car Information */}
        <div className="card p-6 md:col-span-3">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Car Information</h2>
          
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-48 h-36 bg-gray-100 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-6">
              <img
                src={appointment.carDetails.thumbnailUrl}
                alt={`${appointment.carDetails.year} ${appointment.carDetails.make} ${appointment.carDetails.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {appointment.carDetails.year} {appointment.carDetails.make} {appointment.carDetails.model}
              </h3>
              
              <p className="mt-1 text-xl font-bold text-blue-800">
                SAR {appointment.carDetails.price.toLocaleString()}
              </p>
              
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Condition</p>
                  <p className="font-medium capitalize">{appointment.carDetails.condition}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mileage</p>
                  <p className="font-medium">{appointment.carDetails.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-gray-500">Color</p>
                  <p className="font-medium">{appointment.carDetails.color}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fuel Type</p>
                  <p className="font-medium">{appointment.carDetails.fuelType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transmission</p>
                  <p className="font-medium capitalize">{appointment.carDetails.transmission}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <StatusBadge status={appointment.carDetails.status} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="btn btn-secondary">
              View Car Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;