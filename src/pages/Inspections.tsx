import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, Plus, RefreshCw, Calendar, MapPin, 
  ChevronRight, AlertTriangle, Clock, User
} from 'lucide-react';
import { InspectionRequest, User as UserInterface, Car } from '../types';

// Mock data for inspection requests
const mockInspections: (InspectionRequest & { userDetails: UserInterface, carDetails: Car })[] = [
  {
    id: '1',
    userId: '1',
    carId: '3',
    requestDate: '2025-04-25',
    inspectionDate: '2025-04-28',
    location: 'Baddelha Riyadh Branch',
    status: 'scheduled',
    priority: 'high',
    inspectorId: '2',
    notes: 'Customer wants comprehensive inspection before purchase',
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
    requestDate: '2025-04-24',
    location: 'Customer Location - Jeddah',
    status: 'pending',
    priority: 'medium',
    notes: 'Pre-sale inspection required for trade-in evaluation',
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
    requestDate: '2025-04-23',
    inspectionDate: '2025-04-26',
    location: 'Baddelha Dammam Branch',
    status: 'in-progress',
    priority: 'high',
    inspectorId: '2',
    notes: 'Insurance claim inspection - check for accident damage',
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
    requestDate: '2025-04-22',
    inspectionDate: '2025-04-25',
    location: 'Baddelha Riyadh Branch',
    status: 'completed',
    priority: 'low',
    inspectorId: '2',
    notes: 'Routine inspection completed successfully',
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
    requestDate: '2025-04-21',
    location: 'Customer Location - Riyadh',
    status: 'cancelled',
    priority: 'low',
    notes: 'Customer cancelled inspection request',
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

const Inspections = () => {
  const { user } = useAuth();
  const [inspections] = useState(mockInspections);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  // Filter inspections based on user role
  const getFilteredInspections = () => {
    let filtered = inspections;
    
    // If inspector, only show their assigned inspections or unassigned ones
    if (user?.role === 'inspector') {
      filtered = inspections.filter(inspection => 
        !inspection.inspectorId || inspection.inspectorId === user.id
      );
    }
    
    // Apply search and status filters
    return filtered.filter((inspection) => {
      const searchStr = `${inspection.userDetails.name} ${inspection.carDetails.make} ${inspection.carDetails.model}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === '' || inspection.status === selectedStatus;
      const matchesPriority = selectedPriority === '' || inspection.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const filteredInspections = getFilteredInspections();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
    return null;
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
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Inspections list */}
      <div className="space-y-4">
        {filteredInspections.map((inspection) => (
          <Link 
            to={`/inspections/${inspection.id}`}
            key={inspection.id} 
            className="card p-6 block hover:shadow-md animated-transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
                <div className="mb-4 md:mb-0 md:mr-4">
                  <img
                    src={inspection.carDetails.thumbnailUrl}
                    alt={`${inspection.carDetails.year} ${inspection.carDetails.make} ${inspection.carDetails.model}`}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {inspection.carDetails.year} {inspection.carDetails.make} {inspection.carDetails.model}
                    </h3>
                    <StatusBadge status={inspection.status} />
                    <span className={`badge ${getPriorityColor(inspection.priority)} flex items-center`}>
                      {getPriorityIcon(inspection.priority)}
                      {inspection.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{inspection.userDetails.name}</span>
                    <span className="mx-2">•</span>
                    <span>{inspection.userDetails.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {inspection.inspectionDate ? 
                      `Scheduled: ${formatDate(inspection.inspectionDate)}` :
                      `Requested: ${formatDate(inspection.requestDate)}`
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="truncate max-w-48">{inspection.location}</span>
                </div>
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
          </Link>
        ))}

        {filteredInspections.length === 0 && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inspection requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspections;