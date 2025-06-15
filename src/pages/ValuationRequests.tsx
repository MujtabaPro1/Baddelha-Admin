import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { ValuationRequest, User, Car } from '../types';

// Mock data for valuation requests
const mockValuations: (ValuationRequest & { userDetails: User, carDetails: Car })[] = [
  {
    id: '1',
    userId: '1',
    carId: '3',
    requestDate: '2025-04-25',
    bankName: 'Saudi National Bank',
    status: 'pending',
    userDetails: {
      id: '1',
      name: 'Ahmed Mohammed',
      email: 'ahmed@example.com',
      phone: '+966 50 123 4567',
      role: 'customer',
      status: 'active',
      createdAt: '2023-05-15T08:30:00Z'
    },
    carDetails: {
      id: '3',
      make: 'Nissan',
      model: 'Patrol',
      year: 2023,
      price: 235000,
      condition: 'new',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Silver',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '2',
    userId: '2',
    carId: '5',
    requestDate: '2025-04-24',
    bankName: 'Al Rajhi Bank',
    status: 'approved',
    amount: 82000,
    notes: 'Approved with 96% of listing price',
    userDetails: {
      id: '2',
      name: 'Fatima Al-Saud',
      email: 'fatima@example.com',
      phone: '+966 55 987 6543',
      role: 'customer',
      status: 'active',
      createdAt: '2023-07-22T14:45:00Z'
    },
    carDetails: {
      id: '5',
      make: 'Hyundai',
      model: 'Sonata',
      year: 2021,
      price: 85000,
      condition: 'used',
      mileage: 30000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Red',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '3',
    userId: '4',
    carId: '2',
    requestDate: '2025-04-23',
    bankName: 'Riyad Bank',
    status: 'rejected',
    notes: 'Vehicle does not meet bank criteria for age and condition',
    userDetails: {
      id: '4',
      name: 'Nora Al-Qahtani',
      email: 'nora@example.com',
      phone: '+966 56 234 5678',
      role: 'customer',
      status: 'inactive',
      createdAt: '2023-08-05T09:15:00Z'
    },
    carDetails: {
      id: '2',
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      price: 95000,
      condition: 'used',
      mileage: 25000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Black',
      status: 'sold',
      thumbnailUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '4',
    userId: '3',
    carId: '4',
    requestDate: '2025-04-22',
    bankName: 'Arab National Bank',
    status: 'pending',
    userDetails: {
      id: '3',
      name: 'Mohammed Abdullah',
      email: 'mohammed@example.com',
      phone: '+966 54 456 7890',
      role: 'dealer',
      status: 'active',
      createdAt: '2023-06-10T11:20:00Z'
    },
    carDetails: {
      id: '4',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2020,
      price: 180000,
      condition: 'used',
      mileage: 45000,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'Blue',
      status: 'pending',
      thumbnailUrl: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '5',
    userId: '5',
    carId: '1',
    requestDate: '2025-04-21',
    bankName: 'Saudi British Bank',
    status: 'approved',
    amount: 105000,
    notes: 'Approved for financing. Documents ready.',
    userDetails: {
      id: '5',
      name: 'Khalid Al-Harbi',
      email: 'khalid@example.com',
      phone: '+966 53 876 5432',
      role: 'dealer',
      status: 'active',
      createdAt: '2023-04-30T16:40:00Z'
    },
    carDetails: {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 110000,
      condition: 'new',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'automatic',
      color: 'White',
      status: 'available',
      thumbnailUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  }
];

const ValuationRequests = () => {
  const [valuations] = useState(mockValuations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  // Get unique bank names
  const banks = Array.from(new Set(valuations.map(v => v.bankName)));

  const filteredValuations = valuations.filter((valuation) => {
    const searchStr = `${valuation.userDetails.name} ${valuation.carDetails.make} ${valuation.carDetails.model}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === '' || valuation.status === selectedStatus;
    const matchesBank = selectedBank === '' || valuation.bankName === selectedBank;
    
    return matchesSearch && matchesStatus && matchesBank;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <PageHeader 
        title="Bank Valuation Requests" 
        description="Manage valuation requests for financing"
        actions={
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-1" /> New Request
          </button>
        }
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search valuations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="sm:w-48 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All banks</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Valuation request cards */}
      <div className="space-y-4">
        {filteredValuations.map((valuation) => (
          <div key={valuation.id} className="card p-6 hover:shadow-md animated-transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <img
                    src={valuation.carDetails.thumbnailUrl}
                    alt={`${valuation.carDetails.year} ${valuation.carDetails.make} ${valuation.carDetails.model}`}
                    className="h-20 w-32 object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {valuation.carDetails.year} {valuation.carDetails.make} {valuation.carDetails.model}
                    </h3>
                    <span className="ml-3">
                      <StatusBadge status={valuation.status} />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {valuation.userDetails.name} • {formatDate(valuation.requestDate)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Bank:</span> {valuation.bankName}
                  </p>
                  {valuation.amount && (
                    <p className="mt-1 text-base font-bold text-blue-800">
                      Valuation: SAR {valuation.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex md:flex-col items-center md:items-end">
                {valuation.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button className="btn btn-primary py-1 px-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </button>
                    <button className="btn btn-danger py-1 px-3 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </button>
                  </div>
                )}
                {valuation.status !== 'pending' && (
                  <button className="btn btn-secondary py-1 px-3">
                    View Details
                  </button>
                )}
              </div>
            </div>
            
            {valuation.notes && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Notes:</p>
                <p className="text-sm text-gray-700 mt-1">{valuation.notes}</p>
              </div>
            )}
          </div>
        ))}

        {filteredValuations.length === 0 && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No valuation requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationRequests;