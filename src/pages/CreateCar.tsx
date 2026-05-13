import { useState, useEffect } from 'react';
import axiosInstance from '../service/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarMake {
  id: number;
  name: string;
}

interface CarModel {
  id: number;
  name: string;
}

interface BodyType {
  id: number;
  name: string;
}

interface EngineSize {
  id: number;
  name: string;
}

interface Mileage {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  enName: string;
  arName: string;
}

interface TimeSlot {
  label: string;
}

interface BranchTiming {
  day: string;
  date: string;
  slots: TimeSlot[];
}

const CreateCar = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Step 2 state
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [engineSizes, setEngineSizes] = useState<EngineSize[]>([]);
  const [mileages, setMileages] = useState<Mileage[]>([]);
  
  // Step 3 state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchTimings, setBranchTimings] = useState<BranchTiming[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1
    makeId: '',
    makeName: '',
    modelId: '',
    modelName: '',
    year: '',
    
    // Step 2
    bodyTypeId: '',
    bodyTypeName: '',
    engineSizeId: '',
    engineSizeName: '',
    mileageId: '',
    mileageName: '',
    carPrice: '',
    option: 'Basic',
    paint: 'Original',
    gccSpecs: 'GCC Specs',
    ownershipStatus: 'First owner',
    fuelType: 'Gasoline',
    transmissionType: 'Automatic',
    accidentHistory: 'No',
    vehicleCondition: 'Excellent',
    
    // Step 3
    branchId: '',
    selectedDate: '',
    selectedDay: '',
    selectedTimeSlot: ''
  });

  // Generate years on mount
  useEffect(() => {
    const yearOptions = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() - i).toString());
    setYears(yearOptions);
  }, []);

  // Fetch makes on mount
  useEffect(() => {
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (formData.makeId) {
      fetchModels(formData.makeId);
    } else {
      setModels([]);
    }
  }, [formData.makeId]);

  // Fetch data for step 2
  useEffect(() => {
    if (currentStep === 2) {
      fetchBodyTypes();
      fetchEngineSizes();
      fetchMileages();
    }
  }, [currentStep]);

  // Fetch data for step 3
  useEffect(() => {
    if (currentStep === 3) {
      fetchBranches();
      fetchBranchTimings();
    }
  }, [currentStep]);

  const fetchMakes = async () => {
    try {
      const response = await axiosInstance.get('/1.0/car-options/car-make');
      setMakes(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching makes:', error);
    }
  };

  const fetchModels = async (makeId: string) => {
    setLoadingModels(true);
    try {
      const response = await axiosInstance.get(`/1.0/car-options/car-model/${makeId}`);
      setModels(response.data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchBodyTypes = async () => {
    try {
      const response = await axiosInstance.get('/1.0/car-options/body-types');
      setBodyTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching body types:', error);
    }
  };

  const fetchEngineSizes = async () => {
    try {
      const response = await axiosInstance.get('/1.0/car-options/engine-size');
      setEngineSizes(response.data || []);
    } catch (error) {
      console.error('Error fetching engine sizes:', error);
    }
  };

  const fetchMileages = async () => {
    try {
      const response = await axiosInstance.get('/1.0/car-options/car-mileage');
      setMileages(response.data || []);
    } catch (error) {
      console.error('Error fetching mileages:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch');

      setBranches(response.data?.filter((branch: any) => branch.is_active) || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBranchTimings = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch-timing');
      setBranchTimings(response.data || []);
    } catch (error) {
      console.error('Error fetching branch timings:', error);
    }
  };

  const handleInputChange = (field: string, value: string, name?: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(name && { [`${field.replace('Id', 'Name')}`]: name })
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.makeId || !formData.modelId || !formData.year) {
        alert('Please fill all required fields in Step 1');
        return false;
      }
    } else if (step === 2) {
      if (!formData.bodyTypeId || !formData.engineSizeId || !formData.mileageId || !formData.carPrice) {
        alert('Please fill all required fields in Step 2');
        return false;
      }
    } else if (step === 3) {
      if (!formData.branchId || !formData.selectedDate || !formData.selectedTimeSlot) {
        alert('Please fill all required fields in Step 3');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      const payload = {
        accidentHistory: formData.accidentHistory,
        branchId: Number(formData.branchId),
        bodyType: formData.bodyTypeName,
        carPrice: Number(formData.carPrice),
        engineSize: formData.engineSizeName,
        engineSizeName: formData.engineSizeName,
        fuelType: formData.fuelType,
        gccSpecs: formData.gccSpecs,
        make: formData.makeName,
        makeId: Number(formData.makeId),
        mileage: formData.mileageName,
        mileageName: formData.mileageName,
        model: formData.modelName,
        modelId: Number(formData.modelId),
        option: formData.option,
        ownershipStatus: formData.ownershipStatus,
        paint: formData.paint,
        transmissionType: formData.transmissionType,
        vehicleCondition: formData.vehicleCondition,
        year: formData.year,
        appointmentDate: formData.selectedDate,
        appointmentDay: formData.selectedDay,
        appointmentTime: formData.selectedTimeSlot
      };

      await axiosInstance.post('/1.0/car/admin/create', payload);
      alert('Car created successfully!');
      
      // Reset form
      window.location.href = '/cars';
    } catch (error) {
      console.error('Error creating car:', error);
      alert('Failed to create car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: 'Car Details' },
      { number: 2, label: 'Specifications' },
      { number: 3, label: 'Branch & Timing' }
    ];

    return (
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center relative z-10" style={{ width: '33.33%' }}>
              <div className={`flex items-center justify-center w-14 h-14 rounded-full font-semibold text-lg transition-all ${
                currentStep >= step.number 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.number}
              </div>
              <span className={`mt-3 text-sm font-medium transition-colors ${
                currentStep === step.number ? 'text-blue-900' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              
              {index < steps.length - 1 && (
                <div 
                  className="absolute top-7 left-1/2 w-full h-0.5 -z-10"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  <div className={`h-full transition-colors ${
                    currentStep > step.number ? 'bg-blue-900' : 'bg-gray-300'
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 1: Car Details</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Car Make *</label>
        <select
          value={formData.makeId}
          onChange={(e) => {
            const make = makes.find(m => m.id.toString() === e.target.value);
            handleInputChange('makeId', e.target.value, make?.name);
            setFormData(prev => ({ ...prev, modelId: '', modelName: '' }));
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="">Select Make</option>
          {makes.map((make) => (
            <option key={make.id} value={make.id}>{make.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Car Model *</label>
        <select
          value={formData.modelId}
          onChange={(e) => {
            const model = models.find(m => m.id.toString() === e.target.value);
            handleInputChange('modelId', e.target.value, model?.name);
          }}
          disabled={!formData.makeId || loadingModels}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
        >
          <option value="">Select Model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
        {loadingModels && <p className="text-sm text-gray-500 mt-1">Loading models...</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
        <select
          value={formData.year}
          onChange={(e) => handleInputChange('year', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderOptionButtons = (label: string, field: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleInputChange(field, option)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              formData[field as keyof typeof formData] === option
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Step 2: Car Specifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body Type *</label>
          <select
            value={formData.bodyTypeId}
            onChange={(e) => {
              const bodyType = bodyTypes.find(b => b.id.toString() === e.target.value);
              handleInputChange('bodyTypeId', e.target.value, bodyType?.name);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">Select Body Type</option>
            {bodyTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Engine Size *</label>
          <select
            value={formData.engineSizeId}
            onChange={(e) => {
              const engineSize = engineSizes.find(es => es.id.toString() === e.target.value);
              handleInputChange('engineSizeId', e.target.value, engineSize?.name);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">Select Engine Size</option>
            {engineSizes.map((size) => (
              <option key={size.id} value={size.id}>{size.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mileage *</label>
        <select
          value={formData.mileageId}
          onChange={(e) => {
            const mileage = mileages.find(m => m.id.toString() === e.target.value);
            handleInputChange('mileageId', e.target.value, mileage?.value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="">Select Mileage</option>
          {mileages.map((mileage) => (
            <option key={mileage.id} value={mileage.id}>{mileage.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Car Price (SAR) *</label>
        <input
          type="number"
          value={formData.carPrice}
          onChange={(e) => handleInputChange('carPrice', e.target.value)}
          placeholder="Enter car price"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      </div>

      {renderOptionButtons('Option', 'option', ['Basic', 'Mid', 'Full'])}
      {renderOptionButtons('Paint', 'paint', ['Original', 'Partial', 'Total'])}
      {renderOptionButtons('GCC Specs?', 'gccSpecs', ['GCC Specs', 'Non GCC'])}
      {renderOptionButtons('Ownership Status', 'ownershipStatus', ['First owner', 'Second owner'])}
      {renderOptionButtons('Fuel Type', 'fuelType', ['Gasoline', 'Diesel', 'Hybrid', 'Electric'])}
      {renderOptionButtons('Transmission Type', 'transmissionType', ['Automatic', 'Manual'])}
      {renderOptionButtons('Accident History', 'accidentHistory', ['No', 'Yes', 'Minor'])}
      {renderOptionButtons('Vehicle Condition', 'vehicleCondition', ['Excellent', 'Good', 'Fair', 'Needs Work'])}
    </div>
  );

  const renderStep3 = () => {
    const selectedTiming = branchTimings.find(t => t.date === formData.selectedDate);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">Step 3: Branch & Timing</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
          <select
            value={formData.branchId}
            onChange={(e) => handleInputChange('branchId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.enName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Date *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {branchTimings.map((timing) => (
              <button
                key={timing.date}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    selectedDate: timing.date,
                    selectedDay: timing.day,
                    selectedTimeSlot: ''
                  }));
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  formData.selectedDate === timing.date
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">{timing.day}</div>
                <div className="text-xs mt-1">{timing.date}</div>
              </button>
            ))}
          </div>
        </div>

        {formData.selectedDate && selectedTiming && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Time Slot *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedTiming.slots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => handleInputChange('selectedTimeSlot', slot.label)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.selectedTimeSlot === slot.label
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderProgressBar()}
        
        <div className="min-h-[500px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCar;
