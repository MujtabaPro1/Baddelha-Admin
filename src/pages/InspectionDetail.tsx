import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, Car as CarIcon, 
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Camera, Upload,
  FileText, AlertTriangle, Save, Send
} from 'lucide-react';
import { InspectionRequest, InspectionReport, User as UserInterface, Car } from '../types';
import { useNavigate } from 'react-router-dom';

// Mock data (same as in Inspections.tsx)
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
  // Add other mock data as needed...
];

const InspectionDetail = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<(InspectionRequest & { userDetails: UserInterface, carDetails: Car }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'report'>('details');
  const navigate = useNavigate();
  // Inspection report form state
  const [reportData, setReportData] = useState<Partial<InspectionReport>>({
    overallCondition: 'good',
    exteriorCondition: 'good',
    interiorCondition: 'good',
    engineCondition: 'good',
    mileageVerified: true,
    defects: [],
    recommendations: '',
    estimatedValue: 0,
    images: []
  });

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundInspection = mockInspections.find(i => i.id === id) || null;
      setInspection(foundInspection);
      if (foundInspection) {
        setReportData(prev => ({
          ...prev,
          estimatedValue: foundInspection.carDetails.price * 0.9 // Default to 90% of listing price
        }));
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };

  const handleReportChange = (field: keyof InspectionReport, value: any) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDefectToggle = (defect: string) => {
    setReportData(prev => ({
      ...prev,
      defects: prev.defects?.includes(defect) 
        ? prev.defects.filter(d => d !== defect)
        : [...(prev.defects || []), defect]
    }));
  };

  const handleSaveReport = () => {
    // Save report logic here
    console.log('Saving report:', reportData);
  };

  const handleSubmitReport = () => {
    // Submit report logic here
    console.log('Submitting report:', reportData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Inspection not found</h2>
        <p className="mt-2 text-gray-600">
          The inspection you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link to="/inspections" className="btn btn-primary">
            Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (inspection.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
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

  const commonDefects = [
    'Scratches on body',
    'Dents',
    'Rust spots',
    'Tire wear',
    'Interior stains',
    'Electrical issues',
    'Engine noise',
    'Brake issues',
    'Air conditioning problems',
    'Paint fading'
  ];

  return (
    <div>
      <div className="mb-8">
        <Link 
          to="/inspections" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Inspections
        </Link>
      </div>
      
      <PageHeader 
        title={`Inspection #${inspection.id}`} 
        actions={
          <div className="flex space-x-3">
            {user?.role === 'admin' && (
              <button className="btn btn-secondary">Edit</button>
            )}
            {inspection.status === 'scheduled' && user?.role === 'inspector' && (
              <button
              onClick={() => navigate(`/inspection-report/${inspection.id}`)}
              className="btn btn-primary flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Start Inspection
              </button>
            )}
          </div>
        }
      />
      
      {/* Status Banner */}
      <div className={`p-4 rounded-md mb-8 flex items-center justify-between ${
        inspection.status === 'pending' ? 'bg-yellow-100' : 
        inspection.status === 'scheduled' ? 'bg-blue-100' :
        inspection.status === 'in-progress' ? 'bg-orange-100' :
        inspection.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className={`ml-2 font-medium ${
            inspection.status === 'pending' ? 'text-yellow-800' : 
            inspection.status === 'scheduled' ? 'text-blue-800' :
            inspection.status === 'in-progress' ? 'text-orange-800' :
            inspection.status === 'completed' ? 'text-green-800' : 'text-red-800'
          }`}>
            This inspection is {inspection.status.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`badge ${getPriorityColor(inspection.priority)} flex items-center`}>
            {inspection.priority === 'high' && <AlertTriangle className="h-4 w-4 mr-1" />}
            {inspection.priority} priority
          </span>
          <StatusBadge status={inspection.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inspection Details
            </button>
            {(user?.role === 'inspector' || inspection.status === 'completed') && (
              <button
                onClick={() => setActiveTab('report')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'report'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Inspection Report
              </button>
            )}
          </nav>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inspection Details */}
          <div className="card p-6 md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inspection Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium">{formatDate(inspection.requestDate)}</p>
                </div>
              </div>
              
              {inspection.inspectionDate && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Date</p>
                    <p className="font-medium">{formatDate(inspection.inspectionDate)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{inspection.location}</p>
                </div>
              </div>
              
              {inspection.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700">{inspection.notes}</p>
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
                  <p className="font-medium">{inspection.userDetails.name}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{inspection.userDetails.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{inspection.userDetails.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Car Information */}
          <div className="card p-6 md:col-span-3">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h2>
            
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-36 bg-gray-100 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-6">
                <img
                  src={inspection.carDetails.thumbnailUrl}
                  alt={`${inspection.carDetails.year} ${inspection.carDetails.make} ${inspection.carDetails.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {inspection.carDetails.year} {inspection.carDetails.make} {inspection.carDetails.model}
                </h3>
                
                <p className="mt-1 text-xl font-bold text-blue-800">
                  SAR {inspection.carDetails.price.toLocaleString()}
                </p>
                
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Condition</p>
                    <p className="font-medium capitalize">{inspection.carDetails.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mileage</p>
                    <p className="font-medium">{inspection.carDetails.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="font-medium">{inspection.carDetails.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fuel Type</p>
                    <p className="font-medium">{inspection.carDetails.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Transmission</p>
                    <p className="font-medium capitalize">{inspection.carDetails.transmission}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <StatusBadge status={inspection.carDetails.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Inspection Report Form */
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Inspection Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition Assessment */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Condition Assessment</h3>
                
                <div>
                  <label className="form-label">Overall Condition</label>
                  <select
                    value={reportData.overallCondition}
                    onChange={(e) => handleReportChange('overallCondition', e.target.value)}
                    className="form-input"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Exterior Condition</label>
                  <select
                    value={reportData.exteriorCondition}
                    onChange={(e) => handleReportChange('exteriorCondition', e.target.value)}
                    className="form-input"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Interior Condition</label>
                  <select
                    value={reportData.interiorCondition}
                    onChange={(e) => handleReportChange('interiorCondition', e.target.value)}
                    className="form-input"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Engine Condition</label>
                  <select
                    value={reportData.engineCondition}
                    onChange={(e) => handleReportChange('engineCondition', e.target.value)}
                    className="form-input"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              
              {/* Mileage and Valuation */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Mileage & Valuation</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mileageVerified"
                    checked={reportData.mileageVerified}
                    onChange={(e) => handleReportChange('mileageVerified', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mileageVerified" className="ml-2 text-sm text-gray-700">
                    Mileage verified
                  </label>
                </div>
                
                {!reportData.mileageVerified && (
                  <div>
                    <label className="form-label">Actual Mileage (km)</label>
                    <input
                      type="number"
                      value={reportData.actualMileage || ''}
                      onChange={(e) => handleReportChange('actualMileage', parseInt(e.target.value))}
                      className="form-input"
                      placeholder="Enter actual mileage"
                    />
                  </div>
                )}
                
                <div>
                  <label className="form-label">Estimated Value (SAR)</label>
                  <input
                    type="number"
                    value={reportData.estimatedValue || ''}
                    onChange={(e) => handleReportChange('estimatedValue', parseInt(e.target.value))}
                    className="form-input"
                    placeholder="Enter estimated value"
                  />
                </div>
              </div>
            </div>
            
            {/* Defects */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Defects Found</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonDefects.map((defect) => (
                  <label key={defect} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportData.defects?.includes(defect) || false}
                      onChange={() => handleDefectToggle(defect)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{defect}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="mt-6">
              <label className="form-label">Recommendations</label>
              <textarea
                value={reportData.recommendations}
                onChange={(e) => handleReportChange('recommendations', e.target.value)}
                rows={4}
                className="form-input"
                placeholder="Enter your recommendations..."
              />
            </div>
            
            {/* Image Upload */}
            <div className="mt-6">
              <label className="form-label">Inspection Images</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload images</span>
                      <input type="file" className="sr-only" multiple accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={handleSaveReport}
                className="btn btn-secondary flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </button>
              <button
                onClick={handleSubmitReport}
                className="btn btn-primary flex items-center"
              >
                <Send className="h-4 w-4 mr-1" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetail;