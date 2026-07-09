import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '../service/api';


const numberWithComma = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Define interfaces for API responses
interface DealershipResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  contactPerson: string;
  dateCreated: string;
  rating: number;
  totalCars: number;
  activeListings: number;
  soldCars: number;
  pendingCars: number;
  monthlyPerformance: {
    month: string;
    sales: number;
    listings: number;
  }[];
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  exactModel: string;
  sellingPrice: number;
  status: 'available' | 'pending' | 'sold' | 'unlisted';
  imageUrl: string;
  images?: { url: string }[];
  dealershipId: string;
  createdAt: string;
}
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import TradeInDealershipForm from '../components/TradeInDealershipForm';
import DealershipCarForm from '../components/DealershipCarForm';

const TradeInDealershipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealership, setDealership] = useState<DealershipResponse | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form visibility states
  const [showDealershipForm, setShowDealershipForm] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingDealership, setEditingDealership] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [carToDeactivate, setCarToDeactivate] = useState<Car | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    // Fetch dealership details from API
    const fetchDealershipDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/1.0/dealership/find/${id}`);
        if (response.data) {
          setDealership(response.data);

          //https://stg-service.bddelha.com/api/1.0/dealership-car/find-all?dealershipId=00704a9f-8f85-4800-bc09-76f90555d7d4
          const carResponse = await axiosInstance.get(`/1.0/dealership-car/find-all?dealershipId=${id}&page=1&limit=100`);
          console.log("carResponse", carResponse);
          if (carResponse.data?.data) {
            setCars(carResponse.data?.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dealership details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealershipDetails();
  }, [id]);

  const handleRefresh = async () => {
    // Fetch fresh data from the API
    setLoading(true);
    try {
      const response = await axiosInstance.get(`1.0/dealership/find?id=${id}`);
      if (response.data) {
        setDealership(response.data);
        
        // For now, we'll keep the same mock cars
        // This will be updated when you provide the cars API endpoint
        // No need to change the cars on refresh for now
      }
    } catch (error) {
      console.error('Error refreshing dealership details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Dealership form handlers
  const handleEditDealership = () => {
    setEditingDealership(true);
    setShowDealershipForm(true);
  };
  
  const handleDealershipFormSubmit = async (formData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    logo?: File;
  }) => {
    // Send the updated data to the API
    if (dealership) {
      try {
        // In a real implementation, you might need to handle file uploads separately
        const response = await axios.patch(`1.0/dealership/update`, {
          id: dealership.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
        });
        
        if (response.data) {
          setDealership(response.data);
        }
      } catch (error) {
        console.error('Error updating dealership:', error);
      }
    }
    setShowDealershipForm(false);
    setEditingDealership(false);
  };
  
  // Car form handlers
  const handleAddCar = () => {
    setEditingCar(null);
    setShowCarForm(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setShowCarForm(true);
  };

  const handleDeactivateClick = (car: Car) => {
    setCarToDeactivate(car);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!carToDeactivate) return;
    
    setDeactivating(true);
    try {
      await axiosInstance.put(`/1.0/dealership-car/update/${carToDeactivate.id}`, {
        status: 'Unlisted'
      });
      
      // Update local state
      setCars(cars.map(c => 
        c.id === carToDeactivate.id ? { ...c, status: 'unlisted' as const } : c
      ));
      
      setShowDeactivateModal(false);
      setCarToDeactivate(null);
    } catch (error) {
      console.error('Error deactivating car:', error);
    } finally {
      setDeactivating(false);
    }
  };
  
  const handleCarFormSubmit = async (formData: {
    make: string;
    model: string;
    year: string;
    exactModel: string;
    price: number;
    image?: File;
  }) => {
    if (dealership) {
      try {
        setLoading(true);
        
        if (editingCar) {
          // UPDATE existing car
          await axiosInstance.put(`/1.0/dealership-car/update/${editingCar.id}`, {
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year),
            exactModel: formData.exactModel,
            sellingPrice: formData.price,
          });
          
          // Handle image upload if new image provided
          if (formData.image) {
            const imageFormData = new FormData();
            imageFormData.append('file', formData.image);
            imageFormData.append('imageableId', editingCar.id);
            imageFormData.append('imageableType', 'Dealership');
            imageFormData.append('fileCaption', 'Cover');
            
            await axiosInstance.post('/1.0/media/upload', imageFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
          
          // Update local state
          setCars(cars.map(c => 
            c.id === editingCar.id 
              ? { ...c, make: formData.make, model: formData.model, year: formData.year, exactModel: formData.exactModel, sellingPrice: formData.price }
              : c
          ));
          
        } else {
          // CREATE new car
          const carResponse = await axiosInstance.post(`/1.0/dealership-car/${dealership.id}/create`, {
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year),
            exactModel: formData.exactModel,
            sellingPrice: formData.price,
            dealershipId: dealership.id
          });
          
          if (carResponse.data && formData.image) {
            const carId = carResponse.data.id;
            const imageFormData = new FormData();
            imageFormData.append('file', formData.image);
            imageFormData.append('imageableId', carId);
            imageFormData.append('imageableType', 'Dealership');
            imageFormData.append('fileCaption', 'Cover');
            
            await axiosInstance.post('/1.0/media/upload', imageFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
          
          // Refresh cars list
          const carRefresh = await axiosInstance.get(`/1.0/dealership-car/find-all?dealershipId=${id}`);
          if (carRefresh.data?.data) {
            setCars(carRefresh.data.data);
          }
        }
        
        // Refresh dealership stats
        const refreshResponse = await axiosInstance.get(`/1.0/dealership/find/${id}`);
        if (refreshResponse.data) {
          setDealership(refreshResponse.data);
        }
        
      } catch (error) {
        console.error('Error saving car:', error);
        setError('Failed to save car. Please try again.');
      } finally {
        setLoading(false);
        setShowCarForm(false);
        setEditingCar(null);
      }
    } else {
      setError('Dealership information is missing. Please refresh the page.');
      setShowCarForm(false);
    }
  };
  
  const handleCancelForm = () => {
    setShowDealershipForm(false);
    setShowCarForm(false);
    setEditingDealership(false);
    setEditingCar(null);
  };

  const filteredCars = cars.filter(car => {
    if (activeTab === 'all') return true;
    return car.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-blue-900 font-medium">Loading dealership details...</div>
      </div>
    );
  }

  if (!dealership) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 font-medium mb-4">Dealership not found</div>
        <button
          onClick={() => navigate('/tradein-dealerships')}
          className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dealerships
        </button>
      </div>
    );
  }

  return (
    <div>      
      {/* Dealership Form */}
      {showDealershipForm && dealership && (
        <TradeInDealershipForm
          onSubmit={handleDealershipFormSubmit}
          onCancel={handleCancelForm}
          initialData={{
            name: dealership.name,
            email: dealership.email,
            phone: dealership.phone,
            location: dealership.location,
          }}
          isEdit={editingDealership}
        />
      )}
      
      {/* Car Form */}
      {showCarForm && dealership && (
        <DealershipCarForm
          onSubmit={handleCarFormSubmit}
          onCancel={handleCancelForm}
          dealershipId={dealership.id}
          initialData={editingCar ? {
            make: editingCar.make,
            model: editingCar.model,
            year: editingCar.year,
            exactModel: editingCar.exactModel,
            price: editingCar.sellingPrice,
            imageUrl: editingCar.imageUrl,
          } : undefined}
          isEdit={!!editingCar}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && carToDeactivate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Car Listing</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deactivate the listing for{' '}
              <span className="font-medium">{carToDeactivate.year} {carToDeactivate.make} {carToDeactivate.model}</span>?
              This will change the status to "Unlisted".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeactivateModal(false); setCarToDeactivate(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deactivating}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={deactivating}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tradein-dealerships')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dealership.name}</h1>
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{dealership.location}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleEditDealership}
            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
          >
            <Edit className="h-5 w-5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Dealership details and stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="font-medium">{dealership.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-900" />
                <p className="font-medium">{dealership.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-900" />
                <p className="font-medium">{dealership.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Created</p>
              <p className="font-medium">{new Date(dealership.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center">
                <div className="text-lg font-medium mr-2">{dealership.rating}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(dealership.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Car Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Car Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Total Cars</p>
              <p className="text-2xl font-bold text-blue-900">{dealership?.cars?.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-blue-900">{dealership?.cars?.filter(c => c.status === 'available').length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Sold Cars</p>
              <p className="text-2xl font-bold text-blue-900">{dealership?.cars?.filter(c => c.status === 'sold').length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Pending Cars</p>
              <p className="text-2xl font-bold text-blue-900">{dealership?.cars?.filter(c => c.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dealership.cars?.map((car) => ({
                  month: new Date(car.createdAt).getMonth() + 1,
                  sales: car.status === 'sold' ? 1 : 0,
                  listings: car.status === 'available' ? 1 : 0,
                }))}
                margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#10B981" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="listings" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Car Listings */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Car Listings</h3>
            <button
              onClick={handleAddCar}
              className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Car</span>
            </button>
          </div>

          {/* Tabs for filtering */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({cars.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'available'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Available ({cars.filter(c => c.status === 'available').length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending ({cars.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'sold'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sold ({cars.filter(c => c.status === 'sold').length})
            </button>
          </div>
        </div>

        {/* Car listings grid */}
        <div className="p-6">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div key={car.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  {/* Image with Edit/Remove overlay */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden group">
                    <img 
                      src={car?.images?.length ? car.images?.[0]?.url : '/placeholder-car.jpg'}
                      alt={`${car?.year} ${car?.make} ${car?.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Edit & Remove Buttons */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button 
                        onClick={() => handleEditCar(car)}
                        className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeactivateClick(car)}
                        className="flex items-center gap-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {car?.year} {car?.make} {car?.model}
                      </h3>
                      <StatusBadge status={car?.status || 'available'} />
                    </div>
                    
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-red-500">
                          SAR {numberWithComma(car?.sellingPrice?.toLocaleString())}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">VAT inclusive</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Listed on {new Date(car?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No cars found matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeInDealershipDetail;
