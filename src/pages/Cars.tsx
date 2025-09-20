import React, { useState, useEffect } from 'react';
import AuctionCountdown from '../components/AuctionCountdown';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw, Clock } from 'lucide-react';

import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';


const Cars = () => {
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
    fetchAuctionCars();
  },[]);

  async function fetchAuctionCars() {
    try {
      const resp = await axiosInstance.get("/1.0/auction?status=LIVE", {
        params: {
          search,
          page,
          limit,
        },
      });

      
      if (resp.data.error) {
        setError(resp.data);
      } else {
        setAuctionCars(resp.data.data || []);
      }
    } catch (ex: unknown) {
      console.error('Error fetching auction cars:', ex);
    }
  }

  async function fetchCars() {
    setLoading(true);
    try {
      //let search = "";
      const resp = await axiosInstance.get("/1.0/car/find-all", {
        params: {
          search,
          page,
          limit,
        },
      });

      if (resp.data.error) {
        setError(resp.data);
      } else {

        let _cars = resp.data.data.filter((car: any) => {
          return car.carStatus != 'push_to_inventory' && car.carStatus != 'push_to_auction';
        });

        setData(_cars);
        setTotalCount(_cars.length);
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
    fetchAuctionCars();
  };



  return (
    <div>
      <PageHeader 
        title="Cars & Auctions" 
        description="Manage all cars and auctions in the Baddelha inventory"
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
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Available Cars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-blue-900 font-medium">Loading cars...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div
            onClick={() => navigate(`/cars/details/${car.id}`)}
            key={car.id} className="card overflow-hidden group hover:shadow-md transition-shadow duration-300">
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
        
        {/* Auction Cars - Right side */}
        <div className="md:w-1/3 mt-6 md:mt-0">
          <h2 className="text-xl font-semibold mb-4">Active Auctions</h2>
          <div className="space-y-4">
            {auctionCars && auctionCars.length > 0 ? (
              auctionCars.map((auction) => (
                console.log(auction?.status),
                //|| checkIfAuctionEnded(auction.endTime)
                auction?.status == 'ENDED'  || auction?.car?.carStatus == 'unlisted'  ? null : (
                <div 
                  key={auction.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-100 hover:shadow-md transition-shadow duration-300"
                  onClick={() => navigate(`/cars/details/${auction.carId}?auctionId=${auction.id}`)}
                >
                   {auction.coverImage ? (
                  <img 
                    src={auction.coverImage}
                    alt={`${auction.modelYear} ${auction.make} ${auction.model}`}
                    className="w-[120px] h-[120px] m-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img 
                    src="https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"
                    alt={`${auction.modelYear} ${auction.make} ${auction.model}`}
                    className="w-[120px] h-[120px] m-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">
                        {auction.car?.modelYear} {auction.car?.make} {auction.car?.model}
                      </h3>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Auction
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-lg font-bold text-blue-800">
                        SAR {Number(auction.currentPrice || auction.startPrice).toLocaleString()}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{auction.timeLeft || 'Active'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Starting Price:</span>
                        <span className="font-medium">SAR {Number(auction.startPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Bids:</span>
                        <span className="font-medium">{auction.bidCount || 0}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Time Left:</span>
                        <AuctionCountdown endTime={auction.endTime} />
                      </div>
                    </div>
                  </div>
                </div>
              )))
            ) : (
              <div className="py-8 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No active auctions at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cars;