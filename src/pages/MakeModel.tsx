import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CarMake {
  id: number;
  name: string;
}

interface CarModel {
  id: number;
  carMakeId: number;
  name: string;
}

const MakeModel = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [loading, setLoading] = useState<{ makes: boolean; models: boolean }>({
    makes: false,
    models: false,
  });
  const [error, setError] = useState<{ makes: string | null; models: string | null }>({
    makes: null,
    models: null,
  });

  // Fetch car makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      setLoading(prev => ({ ...prev, makes: true }));
      setError(prev => ({ ...prev, makes: null }));
      
      try {
        const response = await axios.get('https://stg-service.bddelha.com/api/1.0/car-options/car-make');
        setMakes(response.data?.data);
      } catch (err) {
        console.error('Error fetching car makes:', err);
        setError(prev => ({ ...prev, makes: 'Failed to fetch car makes. Please try again.' }));
      } finally {
        setLoading(prev => ({ ...prev, makes: false }));
      }
    };

    fetchMakes();
  }, []);

  // Fetch car models when a make is selected
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoading(prev => ({ ...prev, models: true }));
      setError(prev => ({ ...prev, models: null }));
      
      try {
        const response = await axios.get(`https://stg-service.bddelha.com/api/1.0/car-options/car-model/${selectedMake.id}`);
        setModels(response.data);
      } catch (err) {
        console.error('Error fetching car models:', err);
        setError(prev => ({ ...prev, models: 'Failed to fetch car models. Please try again.' }));
      } finally {
        setLoading(prev => ({ ...prev, models: false }));
      }
    };

    fetchModels();
  }, [selectedMake]);

  const handleMakeSelect = (make: CarMake) => {
    setSelectedMake(make);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Car Makes and Models</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Car Makes Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Car Makes</h2>
            
            {loading.makes ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : error.makes ? (
              <div className="text-red-500">{error.makes}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                {makes.map((make) => (
                  <div
                    key={make.id}
                    onClick={() => handleMakeSelect(make)}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedMake?.id === make.id
                        ? 'bg-blue-100 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {make.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Car Models Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMake ? `${selectedMake.name} Models` : 'Car Models'}
            </h2>
            
            {!selectedMake ? (
              <div className="text-gray-500 text-center py-8">
                Please select a car make to view available models
              </div>
            ) : loading.models ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : error.models ? (
              <div className="text-red-500">{error.models}</div>
            ) : models.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No models found for {selectedMake.name}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="p-3 border rounded-md hover:bg-gray-50"
                  >
                    {model.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeModel;
