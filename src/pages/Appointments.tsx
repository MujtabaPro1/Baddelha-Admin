import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Calendar, Filter, Plus, MapPin, ChevronRight, RefreshCw } from 'lucide-react';
// axios is imported but currently unused as API calls are commented out for demonstration
// @ts-ignore
import axios from 'axios';
import axiosInstance from '../service/api';


const numberWithComma = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const Appointments = () => {
  const [appointments, setAppointments]: any = useState([]);
  const [loading, setLoading]: any = useState<boolean>(true);
  const [error, setError]: any = useState<string | null>(null);
  const [searchQuery, setSearchQuery]: any = useState('');
  const [selectedStatus, setSelectedStatus]: any = useState<string>('');
  const [selectedPurpose, setSelectedPurpose]: any = useState<string>('');

  // Fetch appointments data from API
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sample data for the API call
       
        // In a real scenario, we would make an actual API call like this:
        try {

          const response = await axiosInstance.get('/1.0/book-appointment');
          const data = response.data.map((a: any)=>{
            return {
              ...a,
              car: JSON.parse(a.carDetail),
            }
          });

          console.log(data);
          setAppointments(data);
        } catch (apiError) {
          console.error('API call would have failed:', apiError);
          throw apiError; // Re-throw to be caught by the outer try/catch
        }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);



  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  const formatAppointmentTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${formatTime(time)}`;
  };

  return (
    <div>
      <PageHeader 
        title="Appointments" 
        description="Manage all appointments on the Baddelha platform"
        actions={
          <button className="btn btn-primary flex items-center hidden">
            <Plus className="h-4 w-4 mr-1" /> Add Appointment
          </button>
        }
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 hidden">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <div className="sm:w-48 flex-1">
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All purposes</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="tradeIn">Trade-In</option>
            </select>
          </div>
          <button 
            className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            onClick={()=>fetchAppointments()}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Appointments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={()=>fetchAppointments()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {appointments?.map((appointment: any) => (
              <Link 
                to={`/appointments/${appointment.id}`}
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
                        {'+966' + appointment.phone} • {appointment.email}
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
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-700">
                        {appointment?.Branch?.enName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-2 w-full flex  bg-gray-50 rounded-md">
                    <div className="w-full flex flex-row items-center justify-between">
                      {appointment.car?.carPrice ? <p>Price - <b>SAR {numberWithComma(appointment.car?.carPrice)}</b></p> : <p>Price - <b>SAR 0</b></p>}
                      <p className="text-sm font-medium text-gray-700">
                        Sell
                      </p>
                    </div>
                </div>
                
  
              </Link>
            ))}

            {appointments.length === 0 && (
              <div className="py-12 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No appointments found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;