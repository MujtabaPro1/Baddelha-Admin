import React from 'react';
import { mockDealerships } from '../mock/dealershipData';
import { TradeInAppointment } from '../types/tradeInAppointment';
import StatusBadge from './StatusBadge';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const numberWithComma = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

const formatTime = (timeString: string) => {
  return format(new Date(timeString), 'h:mm a');
};

const formatAppointmentTime = (date: string, time: string) => {
  return `${formatDate(date)} at ${formatTime(time)}`;
};

const DealershipTestView: React.FC = () => {
  // Create a sample appointment with the dealership data
  const sampleAppointment: TradeInAppointment = {
    id: 'test-id',
    uid: 'test-uid',
    customerId: 'customer-id',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '555123456',
    appointmentDate: '2025-09-25T00:00:00.000Z',
    appointmentTime: '2025-09-25T14:30:00.000Z',
    status: 'scheduled',
    branchId: 'branch-1',
    carDetail: 'BMW X5 2023',
    car: {
      make: 'BMW',
      model: 'X5',
      year: 2023,
      carPrice: 250000
    },
    Branch: {
      id: 'branch-1',
      enName: 'Main Branch',
      arName: 'الفرع الرئيسي'
    },
    // Use the first dealership from our mock data
    dealership: mockDealerships[0],
    createdAt: '2025-09-20T10:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z'
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dealership Information in Appointment</h1>
      <div className="card p-6 block hover:shadow-md animated-transition">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {sampleAppointment.car?.make} {sampleAppointment.car?.model} {sampleAppointment.car?.year}
                </h3>
                <span className="ml-3">
                  <StatusBadge status={sampleAppointment.status} />
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {sampleAppointment.customerName} • {"+966" + sampleAppointment.phone} • {sampleAppointment.email}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-700">
                {formatAppointmentTime(sampleAppointment.appointmentDate, sampleAppointment.appointmentTime)}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-700">
                {sampleAppointment?.Branch?.enName || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Dealership Information */}
        {sampleAppointment.dealership && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              {sampleAppointment.dealership.logo?.url ? (
                <img 
                  src={sampleAppointment.dealership.logo.url} 
                  alt={sampleAppointment.dealership.name} 
                  className="h-10 w-10 object-contain rounded-md"
                />
              ) : sampleAppointment.dealership.image ? (
                <img 
                  src={sampleAppointment.dealership.image} 
                  alt={sampleAppointment.dealership.name} 
                  className="h-10 w-10 object-contain rounded-md"
                />
              ) : (
                <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{sampleAppointment.dealership.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{sampleAppointment.dealership.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    {sampleAppointment.dealership.rating} ({sampleAppointment.dealership.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600"><span className="font-medium">Location:</span> {sampleAppointment.dealership.location}</p>
                {sampleAppointment.dealership.tradeInBonus && (
                  <p className="text-gray-600"><span className="font-medium">Trade-In Bonus:</span> SAR {numberWithComma(sampleAppointment.dealership.tradeInBonus)}</p>
                )}
              </div>
              <div>
                <p className="text-gray-600"><span className="font-medium">Processing:</span> {sampleAppointment.dealership.processingTime || 'N/A'}</p>
                <p className="text-gray-600"><span className="font-medium">Contact:</span> {sampleAppointment.dealership.phone}</p>
              </div>
            </div>
            
            {sampleAppointment.dealership.services && sampleAppointment.dealership.services.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Services</p>
                <div className="flex flex-wrap gap-1">
                  {sampleAppointment.dealership.services.map((service, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sampleAppointment.dealership.specialties && sampleAppointment.dealership.specialties.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {sampleAppointment.dealership.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-900 text-white text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-2 w-full flex bg-gray-50 rounded-md">
          <div className="w-full flex flex-row items-center justify-between">
            {sampleAppointment.car?.carPrice ? (
              <p>Price - <b>SAR {numberWithComma(sampleAppointment.car.carPrice)}</b></p>
            ) : (
              <p>Price - <b>SAR 0</b></p>
            )}
            <p className="text-sm font-medium text-gray-700">
              Trade-In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealershipTestView;
