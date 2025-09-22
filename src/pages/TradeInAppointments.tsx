import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Calendar, Filter, MapPin, RefreshCw } from 'lucide-react';
import { findAllTradeInAppointments } from '../service/tradeInAppointment';
import { TradeInAppointment } from '../types/tradeInAppointment';

const numberWithComma = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const TradeInAppointments = () => {
  const [appointments, setAppointments] = useState<TradeInAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch trade-in appointments data from API
  const fetchTradeInAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await findAllTradeInAppointments(searchQuery, currentPage);
      
      console.log(response);
      if (response?.items) {
        const data = response.items.map((a: any) => {
          return {
            ...a,
            car: a?.carDetails,
            // Map dealership data if available
            dealership: a?.dealership ? {
              id: a.dealership.id,
              name: a.dealership.name,
              email: a.dealership.email,
              phone: a.dealership.phone,
              image: a.dealership.image,
              logo: a.dealership.logo,
              address: a.dealership.address,
              location: a.dealership.location,
              website: a.dealership.website,
              rating: a.dealership.rating,
              reviews: a.dealership.reviews,
              services: a.dealership.services,
              specialties: a.dealership.specialties,
              tradeInBonus: a.dealership.tradeInBonus,
              processingTime: a.dealership.processingTime
            } : undefined
          };
        });
        
        setAppointments(data);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch trade-in appointments');
      }
    } catch (err: any) {
      console.error('Error fetching trade-in appointments:', err);
      setError(err.message || 'Failed to load trade-in appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeInAppointments();
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  const formatAppointmentTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${formatTime(time)}`;
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTradeInAppointments();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
    // Apply filter locally for now
    // In a real implementation, we would pass this to the API
  };

  const filteredAppointments = selectedStatus 
    ? appointments.filter(app => app.status === selectedStatus)
    : appointments;

  return (
    <div>
      <PageHeader 
        title="Trade-In Appointments" 
        description="Manage all trade-in appointments on the Baddelha platform"
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="form-input pl-10 w-full"
          />
        </div>
        <div className="sm:w-48 flex-1">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="form-input pl-10 appearance-none w-full"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <button 
          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => fetchTradeInAppointments()}
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Appointments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Loading trade-in appointments...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => fetchTradeInAppointments()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Link 
                  to={`/tradein-appointments/${appointment.id}`}
                  key={appointment.uid} 
                  className="card p-6 block hover:shadow-md animated-transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.car?.make} {appointment.car?.model} {appointment.car?.year}
                          </h3>
                          <span className="ml-3">
                            <StatusBadge status={appointment.status} />
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {appointment.customerName} • {appointment.phone} • {appointment.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">
                          {formatAppointmentTime(appointment.appointmentDate, appointment.appointmentTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dealership Information */}
                  {appointment?.car?.dealership && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        {appointment.car?.dealership?.logo?.url ? (
                          <img 
                            src={appointment.car?.dealership?.logo?.url} 
                            alt={appointment.car?.dealership?.name} 
                            className="h-10 w-10 object-contain rounded-md"
                          />
                        ) : appointment.car?.dealership?.image ? (
                          <img 
                            src={appointment.car?.dealership?.image} 
                            alt={appointment.car?.dealership?.name} 
                            className="h-10 w-10 object-contain rounded-md"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{appointment.car?.dealership?.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.car?.dealership?.name}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              {appointment.car?.dealership?.rating} ({appointment.car?.dealership?.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600"><span className="font-medium">Location:</span> {appointment.car?.dealership?.location}</p>
                          {appointment.car?.dealership?.tradeInBonus && (
                            <p className="text-gray-600"><span className="font-medium">Trade-In Bonus:</span> SAR {numberWithComma(appointment.car?.dealership?.tradeInBonus)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600"><span className="font-medium">Contact:</span> {appointment.car?.dealership?.phone}</p>
                        </div>
                      </div>
                      
                      {appointment.car?.dealership?.services && appointment.car?.dealership?.services.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Services</p>
                          <div className="flex flex-wrap gap-1">
                            {appointment.car?.dealership?.services.map((service, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </Link>
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No trade-in appointments found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md mr-2 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ml-2 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeInAppointments;
