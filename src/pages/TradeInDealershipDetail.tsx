import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { mockDealerships, mockCars, TradeInDealership, Car } from '../mock/dealershipData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatusBadge from '../components/StatusBadge';

const TradeInDealershipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealership, setDealership] = useState<TradeInDealership | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch dealership details
    const fetchDealershipDetails = () => {
      setLoading(true);
      setTimeout(() => {
        const foundDealership = mockDealerships.find(d => d.id === id);
        if (foundDealership) {
          setDealership(foundDealership);
          // Filter cars for this dealership
          const dealershipCars = mockCars.filter(car => car.dealershipId === id);
          setCars(dealershipCars);
        }
        setLoading(false);
      }, 500);
    };

    fetchDealershipDetails();
  }, [id]);

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data from the API
    if (dealership) {
      setDealership({...dealership});
      setCars([...mockCars.filter(car => car.dealershipId === id)]);
    }
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
            onClick={() => {/* Edit dealership functionality */}}
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
              <p className="font-medium">{dealership.contactPerson}</p>
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
              <p className="font-medium">{new Date(dealership.dateCreated).toLocaleDateString()}</p>
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
              <p className="text-2xl font-bold text-blue-900">{dealership.totalCars}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-blue-900">{dealership.activeListings}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Sold Cars</p>
              <p className="text-2xl font-bold text-blue-900">{dealership.soldCars}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Pending Cars</p>
              <p className="text-2xl font-bold text-blue-900">{dealership.pendingCars}</p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dealership.monthlyPerformance}
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
              onClick={() => {/* Add car functionality */}}
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
                      src={car.imageUrl}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <StatusBadge status={car.status} />
                    </div>
                    <p className="mt-2 text-xl font-bold text-blue-800">
                      SAR {car.price.toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Listed on {new Date(car.listedDate).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="p-2 text-blue-900 hover:bg-blue-50 rounded-md">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="h-5 w-5" />
                      </button>
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
