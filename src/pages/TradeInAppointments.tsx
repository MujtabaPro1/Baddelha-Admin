import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Calendar, Filter, MapPin, RefreshCw } from 'lucide-react';
import { findAllTradeInAppointments } from '../service/tradeInAppointment';
import { TradeInAppointment } from '../types/tradeInAppointment';
import axiosInstance from '../service/api';
import CancelAppointmentModal from '../components/CancelAppointmentModal';
import { toast } from 'react-toastify';

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
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  // Fetch dealership details by ID
  const fetchDealershipDetails = async (dealershipId: string) => {
    try {
      const response = await axiosInstance.get(`/1.0/dealership/find/${dealershipId}`);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching dealership details:', error);
      return null;
    }
  };

  // Fetch car details by ID
  const fetchCarDetails = async (dealershipCarId: string) => {
    try {
      const response = await axiosInstance.get(`/1.0/dealership-car/find/${dealershipCarId}`);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching car details:', error);
      return null;
    }
  };

  // Fetch trade-in appointments data from API
  const fetchTradeInAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await findAllTradeInAppointments(searchQuery, currentPage);
      
      console.log(response);
      if (response?.items) {
        // Process each appointment to fetch dealership and car details
        const appointmentsWithDetails = await Promise.all(
          response.items.map(async (appointment: any) => {
            let dealershipData = null;
            let carData = null;
            
            // Extract dealership ID and dealershipCarId from carDetails
            if (appointment?.carDetails) {
              const { dealership: dealershipId, dealershipCarId } = appointment.carDetails;
              
              // Fetch dealership details if dealershipId exists
              if (dealershipId) {
                dealershipData = await fetchDealershipDetails(dealershipId);
              }
              
              // Fetch car details if dealershipCarId exists
              if (dealershipCarId) {
                carData = await fetchCarDetails(dealershipCarId);
              }
            }
            
            // Return appointment with additional data
            console.log({
              ...appointment,
              car: {
                ...appointment?.car,
                ...carData,
                dealership: dealershipData
              },
              tradeInVehicle: appointment?.carDetails?.tradeInVehicle || null
            });
            return {
              ...appointment,
              car: {
                ...appointment?.car,
                ...carData,
                dealership: dealershipData
              },
              tradeInVehicle: appointment?.carDetails?.tradeInVehicle || null
            };
          })
        );
        
        setAppointments(appointmentsWithDetails);
        // Handle pagination data
        if (response.limit) setPageLimit(response.limit);
        if (response.page) setCurrentPage(response.page);
        if (response.total) setTotalItems(response.total);
        if (response.totalPages) setTotalPages(response.totalPages);
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
  }, [currentPage,searchQuery]);

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

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // If status is Cancelled, open the cancel modal instead of directly updating
      if (newStatus === 'Cancelled') {
        setAppointmentToCancel(appointmentId);
        setCancelModalOpen(true);
        return;
      }

      setUpdatingAppointment(appointmentId);
      
      // Use axios instance directly to call the API
      const response = await axiosInstance.patch(
        `/1.0/trade/appointment/update/${appointmentId}`,
        { status: newStatus }
      );
      
      if (response.status === 200) {
        toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
        
        // Update the local state to reflect the change
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app.id === appointmentId ? { ...app, status: newStatus.toLowerCase() as any } : app
          )
        );
        
        // Refresh the appointments list to get the latest data
        fetchTradeInAppointments();
      } else {
        throw new Error(`API returned status code ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      let errorMessage = 'Failed to update appointment status';
      
      // Extract error message from API response if available
      if (error.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : error.response.data.message[0] || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingAppointment(null);
    }
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
              <option value="confirmed">Confirmed</option>
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
                <div 
                  key={appointment.uid || appointment.id} 
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
                            <StatusBadge status={appointment.status.toLowerCase() as 'scheduled' | 'confirmed' | 'completed' | 'cancelled'} />
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {appointment.firstName} {appointment.lastName} • {appointment.phone} • {appointment.email}
                        </p>
                        
                        {/* Trade-In Vehicle Information */}
                        {appointment.tradeInVehicle && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-xs text-blue-700 font-medium">Trade-In Vehicle:</p>
                            <p className="text-sm font-medium">
                              {appointment.tradeInVehicle.year} {appointment.tradeInVehicle.make} {appointment.tradeInVehicle.model}
                              {appointment.tradeInVehicle.estimatedValue && (
                                <span className="ml-2 text-green-600">
                                  SAR {numberWithComma(appointment.tradeInVehicle.estimatedValue)}
                                </span>
                              )}
                            </p>
                            {appointment.tradeInVehicle.condition && (
                              <p className="text-xs text-gray-600">
                                Condition: <span className="capitalize">{appointment.tradeInVehicle.condition}</span> • 
                                Mileage: {numberWithComma(typeof appointment.tradeInVehicle.mileage === 'string' ? parseInt(appointment.tradeInVehicle.mileage) : appointment.tradeInVehicle.mileage || 0)} km
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">
                          {formatAppointmentTime(appointment.appointmentDate, appointment.appointmentTime)}
                        </span>
                      </div>

   {/* Status Update Buttons */}
 
 {appointment.status.toLowerCase() !== 'cancelled' && appointment.status.toLowerCase() !== 'completed' ? <>
  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'Confirmed')}
                      disabled={updatingAppointment === appointment.id || appointment.status.toLowerCase() === 'confirmed'}
                      className={`px-3 py-1 text-xs rounded-md ${appointment.status.toLowerCase() === 'confirmed' 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                        : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      {updatingAppointment === appointment.id ? 'Updating...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'Completed')}
                      disabled={updatingAppointment === appointment.id || appointment.status.toLowerCase() === 'completed'}
                      className={`px-3 py-1 text-xs rounded-md ${appointment.status.toLowerCase() === 'completed' 
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      {updatingAppointment === appointment.id ? 'Updating...' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'Cancelled')}
                      disabled={updatingAppointment === appointment.id || appointment.status.toLowerCase() === 'cancelled'}
                      className={`px-3 py-1 text-xs rounded-md ${appointment.status.toLowerCase() === 'cancelled' 
                        ? 'bg-red-100 text-red-700 cursor-not-allowed' 
                        : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      {updatingAppointment === appointment.id ? 'Updating...' : 'Cancel'}
                    </button>
                  </div>
                   

 </> : null}

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
                                                    <p className="text-gray-600"><span className="font-medium">Email:</span> {appointment.car?.dealership?.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600"><span className="font-medium">Contact:</span> {appointment.car?.dealership?.phone}</p>
                          <p className="text-gray-600"><span className="font-medium">Phone:</span> {appointment.car?.dealership?.phone}</p>
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

                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No trade-in appointments found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
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
                    Page {currentPage} of {totalPages} • {totalItems} items • {pageLimit} per page
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
      
      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal
        appointmentId={appointmentToCancel || ''}
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setAppointmentToCancel(null);
        }}
        onStatusUpdate={async(appointmentId, newStatus, reason)=>{
          try{
          const response = await axiosInstance.patch(
            `/1.0/trade/appointment/update/${appointmentId}`,
            { status: newStatus, cancelledReason: reason }
          );
          if(response.data){
            toast.success('Appointment cancelled successfully');
            fetchTradeInAppointments();
          }
        }catch(ex){
          toast.error('Failed to cancel appointment');
          console.error(ex);
        }

        }}
      />
    </div>
  );
};

export default TradeInAppointments;
