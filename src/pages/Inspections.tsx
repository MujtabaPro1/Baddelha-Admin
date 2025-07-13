import React, { useState, useEffect } from 'react';
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
import axiosInstance from '../service/api';



const Inspections = () => {
  const { user } = useAuth();
  const [inspections,setInspections]: any = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);


  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/1.0/book-appointment');
     
      const data = response?.data.map((a: any)=>{
        return {
          ...a,
          priority: 'high',
          car: JSON.parse(a.carDetail),
        }
      });

      console.log(data);
      setInspections(data);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter inspections based on user role
  



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
        {inspections.filter((inspection: any) => {
          return inspection.status == 'Confirmed';
        }).map((inspection: any) => (
          <Link 
            to={`/inspections/${inspection.uid}`}
            key={inspection.uid} 
            className="card p-6 block hover:shadow-md animated-transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
                <div className="mb-4 md:mb-0 md:mr-4">
                  <img
                    src={'data:image/jpeg;base64,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'}
                    alt={`carImage`}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {inspection.car.year} {inspection.car.make} {inspection.car.model}
                    </h3>
                    <StatusBadge status={inspection.status} />
                    <span className={`badge ${getPriorityColor(inspection.priority)} flex items-center`}>
                      {getPriorityIcon(inspection.priority)}
                      {inspection.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{inspection.firstName + ' ' + inspection.lastName}</span>
                    <span className="mx-2">•</span>
                    <span>{inspection.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {inspection.appointmentDate ? 
                      `Scheduled: ${formatDate(inspection.appointmentDate)}` :
                      `Requested: ${formatDate(inspection.appointmentDate)}`
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="truncate max-w-48">{inspection.Branch?.enName}</span>
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

        {inspections.length === 0 && (
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