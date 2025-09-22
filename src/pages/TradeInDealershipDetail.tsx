import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '../service/api';

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
  status: 'available' | 'pending' | 'sold';
  imageUrl: string;
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

  useEffect(() => {
    // Fetch dealership details from API
    const fetchDealershipDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/1.0/dealership/find/${id}`);
        if (response.data) {
          setDealership(response.data);

          //https://stg-service.bddelha.com/api/1.0/dealership-car/find-all?dealershipId=00704a9f-8f85-4800-bc09-76f90555d7d4
          const carResponse = await axiosInstance.get(`/1.0/dealership-car/find-all?dealershipId=${id}`);
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
        const response = await axios.put(`http://localhost:3000/api/1.0/dealership/update`, {
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
    setShowCarForm(true);
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
        
        // Step 1: Create the car using the dealership-car API endpoint
        const carResponse = await axiosInstance.post(`/1.0/dealership-car/${dealership.id}/create`, {
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year), // Convert to number as required by API
          exactModel: formData.exactModel,
          sellingPrice: formData.price, // API expects sellingPrice
          dealershipId: dealership.id
        });
        
        // Step 2: If car creation was successful and we have an image, upload it
        if (carResponse.data && formData.image) {
          const carId = carResponse.data.id; // Assuming the API returns the created car with an ID
          
          // Create FormData for image upload
          const imageFormData = new FormData();
          imageFormData.append('file', formData.image);
          imageFormData.append('imageableId', carId);
          imageFormData.append('imageableType', 'DealershipCar'); // Assuming 'Car' is the correct type
          imageFormData.append('fileCaption', 'logo');
          
          // Upload the image
          await axiosInstance.post('/1.0/media/upload', imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        // Step 3: Refresh the dealership data to get updated stats
        const refreshResponse = await axiosInstance.get(`/1.0/dealership/find/${id}`);
        if (refreshResponse.data) {
          setDealership(refreshResponse.data);
        }
        
        // Step 4: Fetch the updated list of cars for this dealership
        // For now, we'll add the new car to the existing list
        // In a real implementation, you would fetch the updated list from the API
        const newCar: Car = {
          id: carResponse.data.id || `new-${Date.now()}`,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          exactModel: formData.exactModel,
          price: formData.price,
          status: 'available',
          imageUrl: formData.image ? 'pending-url' : 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3',
          dealershipId: dealership.id,
          listedDate: new Date().toISOString(),
        };
        
        setCars([newCar, ...cars]);
        
      } catch (error) {
        console.error('Error adding car:', error);
        // Set error state
        setError('Failed to add car. Please try again.');
      } finally {
        setLoading(false);
        setShowCarForm(false);
      }
    } else {
      // Set error state
      setError('Dealership information is missing. Please refresh the page.');
      setShowCarForm(false);
    }
  };
  
  const handleCancelForm = () => {
    setShowDealershipForm(false);
    setShowCarForm(false);
    setEditingDealership(false);
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
          className="flex items-center gap-2 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
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
        />
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
            className="flex items-center gap-2 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
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
              className="flex items-center gap-2 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
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
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({cars.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'available'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Available ({cars.filter(c => c.status === 'available').length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending ({cars.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'sold'
                  ? 'bg-blue-900 text-white'
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
                <div key={car.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={car?.images?.length ? car.images?.[0]?.url : 'data:image/jpeg;base64,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'}
                      alt={`${car?.year} ${car?.make} ${car?.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">
                        {car?.year} {car?.make} {car?.model}
                      </h3>
                      <StatusBadge status={car?.status || 'available'} />
                    </div>
                    <p className="mt-2 text-xl font-bold text-blue-800">
                      SAR {car?.sellingPrice?.toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Listed on {new Date(car?.createdAt).toLocaleDateString()}
                    </p>
                    {/* <div className="mt-4 flex justify-end space-x-2">
                      <button className="p-2 text-blue-900 hover:bg-blue-50 rounded-md">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div> */}
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
