import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Calendar, Filter, Plus, MapPin, ChevronRight, RefreshCw } from 'lucide-react';
import { Appointment, User, Car } from '../types';

// Mock data for appointments
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
    notes: 'Customer interested in test drive',
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

const Appointments = () => {
  const [appointments] = useState(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');

  const filteredAppointments = appointments.filter((appointment) => {
    const searchStr = `${appointment.userDetails.name} ${appointment.carDetails.make} ${appointment.carDetails.model}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === '' || appointment.status === selectedStatus;
    const matchesPurpose = selectedPurpose === '' || appointment.purpose === selectedPurpose;
    
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatAppointmentTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${time}`;
  };

  return (
    <div>
      <PageHeader 
        title="Appointments" 
        description="Manage all appointments on the Baddelha platform"
        actions={
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add Appointment
          </button>
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
            placeholder="Search appointments..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All purposes</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="tradeIn">Trade-In</option>
            </select>
          </div>
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Appointments list */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Link 
            to={`/appointments/${appointment.id}`}
            key={appointment.id} 
            className="card p-6 block hover:shadow-md animated-transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {appointment.userDetails.name}
                    </h3>
                    <span className="ml-3">
                      <StatusBadge status={appointment.status} />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {appointment.userDetails.phone} • {appointment.userDetails.email}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">
                    {formatAppointmentTime(appointment.date, appointment.time)}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">
                    {appointment.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {appointment.carDetails.year} {appointment.carDetails.make} {appointment.carDetails.model}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Purpose: <span className="capitalize">{appointment.purpose}</span>
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No appointments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;