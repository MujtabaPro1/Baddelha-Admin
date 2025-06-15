import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { Car } from '../types';

// Mock data for cars
const mockCars: Car[] = [
  { 
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
  },
  { 
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
  },
  { 
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
  },
  { 
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
  },
  { 
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
  },
];

const Cars = () => {
  const [cars] = useState<Car[]>(mockCars);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filteredCars = cars.filter((car) => {
    const searchStr = `${car.make} ${car.model} ${car.year}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesCondition = selectedCondition === '' || car.condition === selectedCondition;
    const matchesStatus = selectedStatus === '' || car.status === selectedStatus;
    
    return matchesSearch && matchesCondition && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <PageHeader 
        title="Cars" 
        description="Manage all cars in the Baddelha inventory"
        actions={
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add Car
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
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Cars grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div key={car.id} className="card overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img 
                src={car.thumbnailUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {car.year} {car.make} {car.model}
                </h3>
                <StatusBadge status={car.status} />
              </div>
              <p className="mt-2 text-xl font-bold text-blue-800">
                SAR {car.price.toLocaleString()}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span>Condition:</span>
                  <span className="ml-1 capitalize font-medium">{car.condition}</span>
                </div>
                <div className="flex items-center">
                  <span>Mileage:</span>
                  <span className="ml-1 font-medium">
                    {car.mileage.toLocaleString()} km
                  </span>
                </div>
                <div className="flex items-center">
                  <span>Fuel:</span>
                  <span className="ml-1 font-medium">{car.fuelType}</span>
                </div>
                <div className="flex items-center">
                  <span>Transmission:</span>
                  <span className="ml-1 capitalize font-medium">
                    {car.transmission}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-sm text-blue-600 hover:text-blue-900">
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCars.length === 0 && (
        <div className="py-12 text-center bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No cars found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Cars;