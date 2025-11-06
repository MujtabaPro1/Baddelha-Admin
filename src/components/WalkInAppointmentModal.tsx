import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-hot-toast';

interface CarOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface WalkInAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WalkInAppointmentModal: React.FC<WalkInAppointmentModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Car options state variables
  const [makes, setMakes] = useState<CarOption[]>([]);
  const [models, setModels] = useState<CarOption[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<CarOption[]>([]);
  const [engineSizes, setEngineSizes] = useState<CarOption[]>([]);
  const [mileageOptions, setMileageOptions] = useState<CarOption[]>([]);
  const [paintOptions] = useState<string[]>(['Original Paint', 'Partial Paint', 'Total Repaint']);
  const [carOptions] = useState<string[]>(['Basic', 'Mid', 'Full Option', 'I don\'t know']);
  const [specOptions] = useState<string[]>(['GCC Specs', 'Non GCC Specs', 'I don\'t know']);
  const [loadingModels, setLoadingModels] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserBranch, setLoadingUserBranch] = useState(false);
  const [branchLocked, setBranchLocked] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    branchId: '',
    make: '',
    makeName: '',
    model: '',
    modelName: '',
    year: '',
    bodyType: '',
    bodyTypeName: '',
    engineSize: '',
    engineSizeName: '',
    mileage: '',
    mileageName: '',
    option: '',
    paint: '',
    specs: '',
    carPrice: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      fetchCarMakes();
      fetchBodyTypes();
      fetchEngineSizes();
      fetchMileageOptions();
      generateYearOptions();
      fetchUserBranch(); // Fetch user's branch information
    }
  }, [isOpen]);
  
  // Effect to fetch models when make changes
  useEffect(() => {
    if (formData.make) {
      fetchCarModels(formData.make);
    }
  }, [formData.make]);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    }
  };

  const fetchCarMakes = async () => {
    try {
      const response = await axiosInstance.get('1.0/car-options/car-make');
      if (response?.data?.data) {
        setMakes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching car makes:', error);
      toast.error('Failed to load car makes');
    }
  };

  const fetchCarModels = async (makeId: string) => {
    if (!makeId) return;
    
    setLoadingModels(true);
    try {
      const response = await axiosInstance.get(`1.0/car-options/car-model/${makeId}`);
      if (response?.data) {
        setModels(response.data);
      }
    } catch (error) {
      console.error('Error fetching car models:', error);
      toast.error('Failed to load car models');
    } finally {
      setLoadingModels(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 20 }, (_, i) => (currentYear - i).toString());
    setYears(yearOptions);
  };

  const fetchBodyTypes = async () => {
    try {
      const response = await axiosInstance.get('1.0/car-options/body-types');
      if (response?.data) {
        setBodyTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching body types:', error);
      toast.error('Failed to load body types');
    }
  };

  const fetchEngineSizes = async () => {
    try {
      const response = await axiosInstance.get('1.0/car-options/engine-size');
      if (response?.data) {
        setEngineSizes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching engine sizes:', error);
      toast.error('Failed to load engine sizes');
    }
  };

  const fetchMileageOptions = async () => {
    try {
      const response = await axiosInstance.get('1.0/car-options/car-mileage');
      if (response?.data) {
        setMileageOptions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching mileage options:', error);
      toast.error('Failed to load mileage options');
    }
  };

  const fetchUserBranch = async () => {
    const user = localStorage.getItem('baddelha_user');
    if (!user) return;
    const userId = JSON.parse(user)?.id;
    if (!userId) return;
    
    setLoadingUserBranch(true);
    try {
      const response = await axiosInstance.get(`1.0/user/find/${userId}`);
      if (response?.data) {
        setUserData(response.data);
        
        // Find inspector data with branch_id
        const inspectorData = response.data.Inspector?.find((inspector: any) => inspector.userId === parseInt(userId) && inspector.branch_id);
        
        if (inspectorData && inspectorData.branch_id) {
          // Auto-populate branch and lock it
          setFormData(prev => ({ ...prev, branchId: inspectorData.branch_id.toString() }));
          setBranchLocked(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user branch:', error);
      toast.error('Failed to load user branch information');
    } finally {
      setLoadingUserBranch(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Handle special cases for dropdowns that need additional data
      if (name === 'make') {
        // Reset model when make changes
        const selectedMake = makes.find(item => item.id == value);
        if (selectedMake) {
          setFormData(prev => ({ 
            ...prev, 
            make: selectedMake.id,
            makeName: selectedMake.name,
            model: '',
            modelName: ''
          }));
        }
      } else if (name === 'model') {
        // Set modelName when model is selected
        const selectedModel = models.find(item => item.id == value);
        if (selectedModel) {
          setFormData(prev => ({ 
            ...prev, 
            model: selectedModel.id,
            modelName: selectedModel.name 
          }));
        }
      } else if (name === 'bodyType') {
        // Set bodyTypeName when bodyType is selected
        const selectedBodyType = bodyTypes.find(item => item.id == value);
        if (selectedBodyType) {
          setFormData(prev => ({ ...prev, 
            bodyType: selectedBodyType.id,
            bodyTypeName: selectedBodyType.name }));
        }
      } else if (name === 'engineSize') {
        // Set engineSizeName when engineSize is selected
        const selectedEngineSize = engineSizes.find(item => item.id == value);
        if (selectedEngineSize) {
          setFormData(prev => ({ ...prev, 
            engineSize: selectedEngineSize.id,
            engineSizeName: selectedEngineSize.name }));
        }
      } else if (name === 'mileage') {
        // Set mileageName when mileage is selected
        const selectedMileage = mileageOptions.find(item => item.id == value);
        if (selectedMileage) {
          setFormData(prev => ({ ...prev, 
            mileage: selectedMileage.id,
            mileageName: selectedMileage.name }));
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      branchId: '',
      make: '',
      makeName: '',
      model: '',
      modelName: '',
      year: '',
      bodyType: '',
      bodyTypeName: '',
      engineSize: '',
      engineSizeName: '',
      mileage: '',
      mileageName: '',
      option: '',
      paint: '',
      specs: '',
      carPrice: 0,
      
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log(formData);

    try {
      const today = new Date();
   
      const appointmentDateTime = new Date(`${today.getMonth()} ${today.getDate()}, ${today.getFullYear()}`).toISOString();


      // We'll use names directly in carDetail instead of IDs

      const carDetail = JSON.stringify({
        make: formData.makeName,
        model: formData.modelName,
        year: formData.year,
        bodyType: formData.bodyTypeName,
        engineSize: formData.engineSizeName,
        mileage: formData.mileageName,
        option: formData.option,
        paint: formData.paint,
        specs: formData.specs,
        carPrice: formData.carPrice ? formData.carPrice : 0,
      });
      
      // Prepare the request body
      const bookingData = {
        branchId: Number(formData.branchId),
        appointmentDate: appointmentDateTime,
        appointmentTime: appointmentDateTime,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: '+966'+formData.phone.replace(/^\+?(966)?/, ''),  // Remove any existing + or 966 prefix
        email: formData.email,
        carDetail,
        status: 'Scheduled',
        type: 'sell'
      };

      // Make API call to create walk-in appointment
      await axiosInstance.post('/1.0/book-appointment/walk-in', bookingData).then((res)=>{
        console.log(res);
        toast.success('Sell request created successfully');
        onSuccess();
        onClose();
        resetForm();
      }).catch((err)=>{
        console.log(err);
        toast.error('Failed to create sell request');
      });
      
  
    } catch (error) {
      console.error('Error creating sell request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create Sell Request</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="text-lg font-medium col-span-full">Customer Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-input w-full"
                placeholder="First Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input w-full"
                placeholder="Last Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
              <div className="flex">
                <div className="bg-gray-100 flex items-center px-3 rounded-l border border-r-0">
                  <span className="text-gray-500">+966</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input w-full rounded-l-none"
                  placeholder="Phone Number without country code"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Email Address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch*</label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                required
                className="form-input w-full"
                disabled={branchLocked}
              >
                <option value="">Select Branch</option>
                {branches.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.enName}
                  </option>
                ))}
              </select>
              {loadingUserBranch && <span className="text-sm text-gray-500">Loading branch information...</span>}
              {branchLocked && <span className="text-sm text-blue-500">Branch auto-assigned based on your profile</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <h3 className="text-lg font-medium col-span-full">Car Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make*</label>
              <select
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                className="form-input w-full"
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model*</label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="form-input w-full"
                disabled={!formData.make || loadingModels}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {loadingModels && <span className="text-sm text-gray-500">Loading models...</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year*</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="form-input w-full"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Body Type</option>
                {bodyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engine Size</label>
              <select
                name="engineSize"
                value={formData.engineSize}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Engine Size</option>
                {engineSizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <select
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Mileage</option>
                {mileageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option</label>
              <select
                name="option"
                value={formData.option}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Option</option>
                {carOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paint</label>
              <select
                name="paint"
                value={formData.paint}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Paint</option>
                {paintOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Car Price (SAR)</label>
              <input
                type="number"
                name="carPrice"
                value={formData.carPrice}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Car Price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specs</label>
              <select
                name="specs"
                value={formData.specs || ''}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Specs</option>
                {specOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Sell Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInAppointmentModal;
