import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, RefreshCw, Phone, Mail, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import axiosInstance from '../service/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import TradeInDealershipForm from '../components/TradeInDealershipForm';

const TradeInDealerships = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showDealershipForm, setShowDealershipForm] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalCars: 0,
    activeListings: 0,
    soldCars: 0,
    pendingCars: 0,
  });
  
 

  // Data for the top dealerships bar chart
  const topDealershipsData = [...dealerships]
    .filter(d => d.totalCars !== undefined)
    .sort((a, b) => (b.totalCars || 0) - (a.totalCars || 0))
    .slice(0, 5)
    .map(d => ({
      name: d.name ? d.name.split(' ')[0] : 'Unknown', // Use first word of name for shorter labels
      cars: d.totalCars || 0
    }));

  // Data for the pie chart
  const statusData = [
    { name: 'Active', value: totalStats.activeListings, color: '#3B82F6' },
    { name: 'Sold', value: totalStats.soldCars, color: '#10B981' },
    { name: 'Pending', value: totalStats.pendingCars, color: '#F59E0B' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const fetchDealerships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/1.0/dealership/find-all');
      setDealerships(response.data?.data);
      setTotalStats({
        totalCars: response.data?.data.reduce((sum: number, d: any) => sum + (d.totalCars || 0), 0),
        activeListings: response.data?.data.reduce((sum: number, d: any) => sum + (d.activeListings || 0), 0),
        soldCars: response.data?.data.reduce((sum: number, d: any) => sum + (d.soldCars || 0), 0),
        pendingCars: response.data?.data.reduce((sum: number, d: any) => sum + (d.pendingCars || 0), 0),
      });
    } catch (err: any) {
      console.error('Error fetching dealerships:', err);
      setError(err.response?.data?.message || 'Failed to fetch dealerships');
      setDealerships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDealerships();
  };

  const handleCancelForm = () => {
    setShowDealershipForm(false);
  };

  const handleDealershipFormSubmit = (formData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    logo?: File;
    id?: string;
  }) => {
    setShowDealershipForm(false);
    // Refresh dealerships list to include the newly added dealership
    fetchDealerships();
  };


  // Fetch dealerships when component mounts
  useEffect(() => {
    fetchDealerships();
  }, []);

  return (
    <div>
      <PageHeader 
        title="TradeIn Dealerships" 
        description="Manage all trade-in dealerships and their inventory"
      />

    {showDealershipForm && (
            <TradeInDealershipForm
              onSubmit={handleDealershipFormSubmit}
              onCancel={handleCancelForm}
              initialData={{
                name: '',
                email: '',
                phone: '',
                location: '',
              }}
              isEdit={false}
            />
      )}

      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search dealerships..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-input pl-10 w-full"
          />
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="form-input pl-10 appearance-none w-full"
            >
              <option value="">All regions</option>
              <option value="Riyadh">Riyadh</option>
              <option value="Jeddah">Jeddah</option>
              <option value="Dammam">Dammam</option>
              <option value="Madinah">Madinah</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button 
          onClick={() => {
            setShowDealershipForm(true);
          }}
          className="sm:w-auto flex items-center justify-center gap-2 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Dealership</span>
        </button>
      </div>
      
      {/* Statistics and Charts */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Dealership Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Total Dealerships</p>
              <p className="text-2xl font-bold text-blue-900">{dealerships.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Total Cars</p>
              <p className="text-2xl font-bold text-blue-900">{totalStats.totalCars}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-blue-900">{totalStats.activeListings}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Sold Cars</p>
              <p className="text-2xl font-bold text-blue-900">{totalStats.soldCars}</p>
            </div>
          </div>
        </div>
        
        {/* Top Dealerships Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Dealerships by Cars</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDealershipsData}
                margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cars" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Car Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Car Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Dealerships List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="mt-4 text-gray-600">Loading dealerships...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchDealerships}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealership
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cars
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealerships?.map((dealership) => (
                <tr 
                  key={dealership.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/tradein-dealerships/${dealership.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {dealership.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {dealership.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dealership.contactPerson}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {dealership.phone}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {dealership.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Total: {dealership.totalCars}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {dealership.activeListings} Active
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {dealership.soldCars} Sold
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {dealership.pendingCars} Pending
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dealership.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {dealership.rating}
                      </div>
                      <div className="ml-1 flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(4) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dealerships.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No dealerships found matching your criteria.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default TradeInDealerships;
