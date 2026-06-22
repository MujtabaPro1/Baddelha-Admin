import React, { useState, useEffect } from 'react';
import AuctionCountdown from '../components/AuctionCountdown';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

import axiosInstance from '../service/api';
import { useNavigate } from 'react-router-dom';



const Cars = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('inspected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [auctionCars, setAuctionCars] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const carType = params.get('carType');
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  


  useEffect(()=>{
    fetchCars();
    fetchAuctionCars();
  },[]);


    useEffect(()=>{
      const userDetails = localStorage.getItem('baddelha_user');
      if(userDetails){
        setUser(JSON.parse(userDetails || '{}'));
      }
    },[]);
  


  useEffect(()=>{
    fetchCars();
  },[search, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchCars();
  }, [selectedStatus]);

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
      const resp = await axiosInstance.get("/1.0/car/find-all", {
        params: {
          search: search || undefined,
          page: currentPage,
          limit: itemsPerPage,
          status: selectedStatus || undefined,
          ...(carType === 'sold' ? { carStatus: 'sold' } : {}),
        },
      });

      console.log('API Response:', resp.data);
      
      const total = resp.data.totalCount || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));

      const carsData = resp.data.data || [];
      
      let _cars = carsData.filter((car: any) => {
        return car.carStatus != 'push_to_inventory' && car.carStatus != 'push_to_auction';
      });

      setData(_cars);
      setTotalCount(_cars.length);
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


    const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  

  const isUserAdmin = () => {
     return user && user?.role && user?.role.includes('admin');
  }



  return (
    <div>
      <PageHeader
        title={carType === 'sold' ? 'Sold Cars' : 'Cars & Auctions'}
        description="Manage all cars and auctions in the Baddelha inventory"
        actions={
          <>
 {carType !== 'sold' && isUserAdmin() ? <button
 onClick={() => navigate('/cars/create')} className="btn btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Car
            </button> : null}
          </>
        }
      />

      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by make, model, year..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-input pl-12 pr-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearch(''); }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
            <div className="relative sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-input pl-10 appearance-none"
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="pending_inspection">Pending</option>
                <option value="inspected">Inspected</option>
                <option value="listed">Listed</option>
                <option value="unlisted">Unlisted</option>
                <option value="sold">Sold</option>
                <option value="hold">Hold</option>
                <option value="returned">Returned</option>
                <option value="push_to_auction">Auction</option>
                <option value="push_to_inventory">Inventory</option>
                <option value="bid_won">Bid Won</option>
                <option value="closed">Closed</option>
              </select>
            </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-lg hover:from-gray-50 hover:to-gray-100 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 font-medium"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cars grid - Main section */}
        <div className={carType === 'sold' ? 'lg:w-full' : 'lg:w-2/3'}>
          {carType !== 'sold' && <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Available Cars</h2>
            <p className="text-sm text-gray-500 mt-1">{totalItems} vehicles in inventory</p>
          </div>}

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {loading ? (
              Array.from({ length: itemsPerPage > 10 ? 10 : itemsPerPage }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              ))
            ) : filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <div
                  onClick={() => navigate(`/cars/details/${car.id}`)}
                  key={car.id}
                  className="group flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <img
                    src={car.coverImage || "https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"}
                    alt={`${car.modelYear} ${car.make} ${car.model}`}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                  />

                  <div className="min-w-[10rem] flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {car.modelYear} {car.make} {car.model}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {car?.id?.slice(0, 8)}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 flex-1">
                    <span>{car.engine || car.engineType || 'N/A'}</span>
                    <span>{car?.exactMileage ? `${(car.exactMileage / 1000).toFixed(0)}K km` : car?.mileage ? `${(car.mileage / 1000).toFixed(0)}K km`: 'N/A' }</span>  
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={car.carStatus || 'new'} />
                  </div>

                  <p className="w-32 shrink-0 text-right font-bold text-blue-700 text-sm">
                    {car.sellingPrice ? `SAR ${Number(car.sellingPrice).toLocaleString()}` :
                     car.bookValue ? `SAR ${Number(car.bookValue).toLocaleString()}` : 'Price TBA'}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-4xl mb-3">🚗</div>
                <p className="text-gray-600 font-medium">No cars found matching your search</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="form-input py-1.5 px-3 w-20 border-gray-200 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>of <span className="font-semibold text-gray-900">{totalItems}</span> items</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : page === '...'
                        ? 'cursor-default text-gray-400'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="text-sm font-medium text-gray-700">
                Page <span className="text-blue-600 font-bold">{currentPage}</span> of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Auction Cars - Sidebar */}
        {carType !== 'sold' && <div className="lg:w-1/3">
          <div className="sticky top-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
                Active Auctions
              </h2>
              <p className="text-sm text-gray-500 mt-1">{auctionCars?.length || 0} live bidding</p>
            </div>

            <div className="space-y-4">
              {auctionCars && auctionCars.length > 0 ? (
                auctionCars.map((auction) => (
                  auction?.status == 'ENDED'  || auction?.car?.carStatus == 'unlisted'  ? null : (
                    <div
                      key={auction.id}
                      className="group bg-white rounded-xl overflow-hidden border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-lg cursor-pointer hover:shadow-amber-100/50"
                      onClick={() => navigate(`/cars/details/${auction.carId}?auctionId=${auction.id}`)}
                    >
                      <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                        {auction.coverImage ? (
                          <img
                            src={auction.coverImage}
                            alt={`${auction.modelYear} ${auction.make} ${auction.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <img
                            src="https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"
                            alt={`${auction.modelYear} ${auction.make} ${auction.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Live
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                          {auction.car?.modelYear} {auction.car?.make} {auction.car?.model}
                        </h3>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-lg font-bold text-transparent bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text">
                            SAR {Number(auction.currentPrice || auction.startPrice).toLocaleString()}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{auction.timeLeft || 'Active'}</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Starting:</span>
                            <span className="font-semibold text-gray-900">SAR {Number(auction.startPrice).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Bids:</span>
                            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{auction.bidCount || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Ends:</span>
                            <AuctionCountdown endTime={auction.endTime} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-gray-600 font-medium text-sm">No active auctions</p>
                  <p className="text-gray-500 text-xs mt-1">Check back soon</p>
                </div>
              )}
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default Cars;