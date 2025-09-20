import React, { useState, useEffect } from 'react';
import AuctionCountdown from '../components/AuctionCountdown';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw, Clock } from 'lucide-react';

import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';


const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [auctionCars, setAuctionCars] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  


  useEffect(()=>{
    fetchCars();
  },[]);


  async function fetchCars() {
    setLoading(true);
    try {
      let search = "";
      const resp = await axiosInstance.get("/1.0/car/find-all?status=push_to_inventory", {
        params: {
          search,
          page,
          limit,
        },
      });

      console.log(resp);
      if (resp.data.error) {
        setError(resp.data);
      } else {
        setData(resp.data.data);
        setTotalCount(resp.data.totalCount);
      }
    } catch (ex: unknown) {
      setError(ex);
    } finally {
      setLoading(false);
    }
  }


  const filteredCars = data.filter((car) => {
    const searchStr = `${car.make} ${car.model} ${car.modelYear}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    
    // Adjust filtering based on the new API response structure
    return matchesSearch;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSearch(e.target.value);
  };
  
  const handleRefresh = () => {
    fetchCars();
  };



  return (
    <div>
      <PageHeader 
        title="Inventory" 
        description="Manage all cars in the Baddelha inventory"
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search cars..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-input pl-10"
          />
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
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
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cars grid - Left side */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-blue-900 font-medium">Loading cars...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div
            onClick={() => navigate(`/cars/details/${car.id}`)}
            key={car.id} className="card max-w-[300px] overflow-hidden group hover:shadow-md transition-shadow duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                {car.coverImage ? (
                  <img 
                    src={car.coverImage}
                    alt={`${car.modelYear} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img 
                    src="https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"
                    alt={`${car.modelYear} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {car.modelYear} {car.make} {car.model}
                  </h3>
                  <StatusBadge status={car.carStatus == 'pending_inspection' ? 'pending' : 'available'} />
                </div>
                <div>
                  <p className='text-[10px] text-gray-500 font-semibold'>Ref {car?.id}</p>
                </div>
                <p className="mt-2 text-xl font-bold text-blue-800">
                  {car.sellingPrice ? `SAR ${Number(car.sellingPrice).toLocaleString()}` : 
                   car.bookValue ? `SAR ${Number(car.bookValue).toLocaleString()}` : 'Price not set'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span>Engine:</span>
                    <span className="ml-1 capitalize font-medium">{car.engine || car.engineType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Mileage:</span>
                    <span className="ml-1 font-medium">
                      {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>Body:</span>
                    <span className="ml-1 font-medium">{car.bodyType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Gear:</span>
                    <span className="ml-1 capitalize font-medium">
                      {car.gearType || 'N/A'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No cars found matching your criteria.</p>
          </div>
        )}
          </div>
        </div>
        
   
      </div>
    </div>
  );
};

export default Inventory;