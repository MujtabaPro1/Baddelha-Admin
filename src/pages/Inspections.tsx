import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Filter, Plus, RefreshCw, Calendar, MapPin, 
  ChevronRight, AlertTriangle, Clock, User, X, UserPlus
} from 'lucide-react';
import { InspectionRequest, User as UserInterface, Car } from '../types';
import axiosInstance from '../service/api';



interface Inspector {
  id: number;
  name: string;
  email: string;
  phone: string;
  branchId: number;
}

const Inspections = () => {
  const { user } = useAuth();
  const [inspections, setInspections]: any = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loadingInspectors, setLoadingInspectors] = useState<boolean>(false);
  const [currentInspection, setCurrentInspection] = useState<any>(null);


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
    
      setInspections(data);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInspectorsByBranch = async (branchId: number) => {
    setLoadingInspectors(true);
    try {
      const response = await axiosInstance.get(`/1.0/inspector/branch/${branchId}`);
      setInspectors(response.data);
    } catch (err) {
      console.error('Error fetching inspectors:', err);
    } finally {
      setLoadingInspectors(false);
    }
  };
  
  const handleAssignInspector = async (inspectorId: number) => {
    try {
      await axiosInstance.post('/1.0/inspection/assign', {
        inspectionId: currentInspection.uid,
        inspectorId: inspectorId
      });
      
      // Update local state to reflect the assignment
      const updatedInspections = inspections.map((inspection: any) => {
        if (inspection.uid === currentInspection.uid) {
          return { ...inspection, inspectorId };
        }
        return inspection;
      });
      
      setInspections(updatedInspections);
      setIsModalOpen(false);
      
      // You might want to add a success notification here
    } catch (err) {
      console.error('Error assigning inspector:', err);
      // You might want to add an error notification here
    }
  };
  
  const openAssignModal = (inspection: any) => {
    setCurrentInspection(inspection);
    if (inspection.Branch?.id) {
      fetchInspectorsByBranch(inspection.Branch.id);
      setIsModalOpen(true);
    } else {
      console.error('No branch ID found for this inspection');
      // You might want to add an error notification here
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
      
      {/* Inspector Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Assign Inspector</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingInspectors ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading inspectors...</p>
                </div>
              ) : inspectors.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-600">No inspectors found for this branch.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inspectors.map((inspector) => (
                    <div 
                      key={inspector.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAssignInspector(inspector.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{inspector.name}</p>
                          <p className="text-sm text-gray-600">{inspector.email}</p>
                          <p className="text-sm text-gray-600">{inspector.phone}</p>
                        </div>
                        <button className="btn btn-sm btn-primary">
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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
                      {inspection.car.year} {inspection.car.make} {inspection.car.model}
                    </h3>
                    <StatusBadge status={inspection.status} />
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
            
            <div className="mt-4 flex justify-between items-center">
              {inspection?.car?.make ? <div 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
               {inspection?.car?.make} {inspection?.car?.model} {inspection?.car?.year}
              </div> : <div className="text-gray-500 text-sm font-medium">No car details</div>}
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  openAssignModal(inspection);
                }}
                className="btn btn-sm btn-outline-primary flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" /> Assign to Inspector
              </button>
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

export default Inspections;