import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, Plus, RefreshCw, Calendar, MapPin, 
  ChevronRight, AlertTriangle, Clock, User, X, UserPlus,
  Play
} from 'lucide-react';
import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';




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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);
  const navigate = useNavigate();
 

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/1.0/inspection/find-all');

    
      setInspections(response?.data?.data);
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



  return (
    <div>
      <PageHeader 
        title="My Inspection Requests" 
        description={user?.role === 'inspector' ? 
          "Manage your assigned inspection requests" : 
          "Manage all inspection requests on the platform"
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
      </div>
      
      {/* Inspections list */}
      <div className="space-y-4">
        {inspections.map((inspection: any) => (
          <div 
            key={inspection.uid} 
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
                      {inspection.Car.year} {inspection.Car.make} {inspection.Car.model}
                    </h3>

                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                  <StatusBadge status={inspection.inspectionStatus} />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center text-sm text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                      Scheduled: {formatDate(inspection.createdAt)}
                  </span>
                </div>
                <button 
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/inspection-report/${inspection.id}`);

                            }}
                            className="btn mt-3 btn-sm btn-primary flex items-center"
                          >
                            Start Inspection
                          </button>
              </div>
            </div>
            
             
     

          </div>
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

export default MyInspections;