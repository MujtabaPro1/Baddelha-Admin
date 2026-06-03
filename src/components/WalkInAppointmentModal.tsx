import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface CarOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface WalkInAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type?: 'call-center' | 'inspector' | 'admin';
}

const WalkInAppointmentModal: React.FC<WalkInAppointmentModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess,
  type = 'inspector'
}) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loadingInspectors, setLoadingInspectors] = useState(false);
  const [branchTimings, setBranchTimings] = useState<any[]>([]);
  const [timingsWithDates, setTimingsWithDates] = useState<any[]>([]);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [selectedTimingIndex, setSelectedTimingIndex] = useState(-1);
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
    carPrice: 0,
    inspectorId: '',
    appointmentDate: '',
    appointmentTime: ''
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

  // Effect to fetch inspectors when branch changes (only for call-center type)
  useEffect(() => {
    if (type === 'call-center' && formData.branchId) {
      fetchInspectorsByBranch(formData.branchId);
    } else {
      setInspectors([]);
      setFormData(prev => ({ ...prev, inspectorId: '' }));
    }
  }, [formData.branchId, type]);

  useEffect(() => {
    if (formData.branchId) {
      fetchTimingsForBranch();
    } else {
      setTimingsWithDates([]);
      setSelectedTimingIndex(-1);
      setFormData(prev => ({ ...prev, appointmentDate: '', appointmentTime: '' }));
    }
  }, [formData.branchId]);

  const computeTimingsWithDates = (timings: any[]) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return timings
      .filter((t: any) => t.slots && t.slots.length > 0)
      .map((t: any) => {
        const targetIdx = daysOfWeek.indexOf(t.day);
        const daysUntil = (targetIdx - today.getDay() + 7) % 7;
        const d = new Date(today);
        d.setDate(today.getDate() + daysUntil);
        return {
          ...t,
          displayDate: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          fullDate: format(d, "yyyy-MM-dd'T'HH:mm:ssXXX")
        };
      });
  };

  const fetchTimingsForBranch = async () => {
    if (!formData.branchId) return;
    
    setLoadingTimings(true);
    setSelectedTimingIndex(-1);
    setFormData(prev => ({ ...prev, appointmentDate: '', appointmentTime: '' }));
    
    try {
      const response = await axiosInstance.get(`/1.0/branch/schedule/availability/${formData.branchId}`);
      const timingsData = response?.data || [];
      const withDates = computeTimingsWithDates(timingsData);
      setBranchTimings(timingsData);
      setTimingsWithDates(withDates);
    } catch (error) {
      console.error('Error fetching branch timings:', error);
      setBranchTimings([]);
      setTimingsWithDates([]);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingTimings(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/1.0/branch');
      let branches = response.data;
      // Filter out branches that are not active
      branches = branches.filter((branch: any) => branch.is_active);
      setBranches(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    }
  };

  const fetchInspectorsByBranch = async (branchId: string) => {
    if (!branchId) return;
    
    setLoadingInspectors(true);
    try {
      const response = await axiosInstance.get(`/1.0/inspector/branch/${branchId}`);
      setInspectors(response.data || []);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      setInspectors([]);
    } finally {
      setLoadingInspectors(false);
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
        console.log(selectedMileage);
        if (selectedMileage) {
          setFormData(prev => ({ ...prev, 
            mileage: selectedMileage.id,
            mileageName: selectedMileage.value }));
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
      inspectorId: '',
      appointmentDate: '',
      appointmentTime: ''
    });
    setInspectors([]);
    setTimingsWithDates([]);
    setSelectedTimingIndex(-1);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate phone number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{9}$/.test(formData.phone.replace(/^\+?(966)?/, ''))) {
      newErrors.phone = 'Please enter a valid 9-digit phone number';
    }
    
    // Validate branch
    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }
    
    // Validate car make
    if (!formData.make) {
      newErrors.make = 'Please select a car make';
    }
    
    // Validate car model
    if (!formData.model) {
      newErrors.model = 'Please select a car model';
    }
    
    // Validate year
    if (!formData.year) {
      newErrors.year = 'Please select a year';
    }
    
    // Validate inspector for call-center type
    if (type === 'call-center' && !formData.inspectorId) {
      newErrors.inspectorId = 'Please select an inspector';
    }

    // Validate appointment date and time when timings are available
    if (timingsWithDates.length > 0 && !formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select an appointment date';
    }
    if (timingsWithDates.length > 0 && formData.appointmentDate && !formData.appointmentTime) {
      newErrors.appointmentTime = 'Please select an appointment time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setLoading(true);

    try {
      const appointmentDate = formData.appointmentDate || new Date().toISOString();
      const appointmentTime = formData.appointmentTime || '';

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

      const bookingData: any = {
        branchId: Number(formData.branchId),
        appointmentDate,
        appointmentTime,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: '+966'+formData.phone.replace(/^\+?(966)?/, ''),  // Remove any existing + or 966 prefix
        email: formData.email,
        carDetail,
        status: 'Scheduled',
        type: 'sell'
      };
      
      // Add inspectorId if call-center type
      if (type === 'call-center' && formData.inspectorId) {
        bookingData.inspectorId = Number(formData.inspectorId);
      }

      // Make API call to create walk-in appointment
      const response = await axiosInstance.post('/1.0/book-appointment/walk-in', bookingData);
      console.log(response);
      toast.success('Sell request created successfully');
      resetForm();
      setErrors({});
      onSuccess(); // This will refresh the inspector inspections list
      onClose();
      
  
    } catch (error: any) {
      console.error('Error creating sell request:', error);
      toast.error(error?.response?.data?.message || 'Failed to create sell request');
    } finally {
      setLoading(false);
    }
  };


  const isFormValid = () => {
    return !!(
      formData.firstName &&
      formData.lastName &&
      formData.phone &&
      formData.email &&
      formData.make &&
      formData.model &&
      formData.year &&
      formData.bodyType &&
      formData.engineSize &&
      formData.mileage &&
      formData.carPrice > 0 &&
      formData.option &&
      formData.paint &&
      formData.specs
    );
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
                onChange={(e) => {
                  handleChange(e);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                }}
                className={`form-input w-full ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="First Name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                }}
                className={`form-input w-full ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Last Name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
              <div className="flex">
                <div className={`bg-gray-100 flex items-center px-3 rounded-l border border-r-0 ${errors.phone ? 'border-red-500' : ''}`}>
                  <span className="text-gray-500">+966</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className={`form-input w-full rounded-l-none ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Phone Number without country code"
                  maxLength={9}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                onChange={(e) => {
                  handleChange(e);
                  if (errors.branchId) setErrors(prev => ({ ...prev, branchId: '' }));
                }}
                className={`form-input w-full ${errors.branchId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                disabled={branchLocked}
              >
                <option value="">Select Branch</option>
                {branches.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.enName}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="text-red-500 text-sm mt-1">{errors.branchId}</p>}
              {loadingUserBranch && <span className="text-sm text-gray-500">Loading branch information...</span>}
              {branchLocked && <span className="text-sm text-blue-500">Branch auto-assigned based on your profile</span>}
            </div>
            
            {type === 'call-center' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspector*</label>
                <select
                  name="inspectorId"
                  value={formData.inspectorId}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.inspectorId) setErrors(prev => ({ ...prev, inspectorId: '' }));
                  }}
                  className={`form-input w-full ${errors.inspectorId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  disabled={!formData.branchId || loadingInspectors}
                >
                  <option value="">Select Inspector</option>
                  {inspectors.map((inspector: any) => (
                    <option key={inspector.id} value={inspector.id}>
                      {inspector.user?.firstName} {inspector.name}
                    </option>
                  ))}
                </select>
                {errors.inspectorId && <p className="text-red-500 text-sm mt-1">{errors.inspectorId}</p>}
                {loadingInspectors && <span className="text-sm text-gray-500">Loading inspectors...</span>}
                {!formData.branchId && <span className="text-sm text-gray-500">Please select a branch first</span>}
                {formData.branchId && !loadingInspectors && inspectors.length === 0 && (
                  <span className="text-sm text-orange-500">No inspectors available for this branch</span>
                )}
              </div>
            )}
          </div>

          {/* Appointment Date & Time */}
          {formData.branchId && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-medium">Appointment Date & Time</h3>
              {loadingTimings ? (
                <p className="text-sm text-gray-500">Loading available slots...</p>
              ) : timingsWithDates.length === 0 ? (
                <p className="text-sm text-orange-500">No time slots configured for this branch.</p>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Day *</label>
                    <div className="flex flex-wrap gap-2">
                      {timingsWithDates.map((t: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedTimingIndex(idx);
                            setFormData(prev => ({ ...prev, appointmentDate: t.fullDate, appointmentTime: '' }));
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-center ${
                            selectedTimingIndex === idx
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">{t.day}</div>
                          <div className="text-xs opacity-80">{t.displayDate}</div>
                        </button>
                      ))}
                    </div>
                    {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>}
                  </div>

                  {selectedTimingIndex >= 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Time *</label>
                      <div className="flex flex-wrap gap-2">
                        {timingsWithDates[selectedTimingIndex]?.slots?.map((slot: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot.label }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.appointmentTime === slot.label
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                      {errors.appointmentTime && <p className="text-red-500 text-sm mt-1">{errors.appointmentTime}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <h3 className="text-lg font-medium col-span-full">Car Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make*</label>
              <select
                name="make"
                value={formData.make}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.make) setErrors(prev => ({ ...prev, make: '' }));
                }}
                className={`form-input w-full ${errors.make ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
              {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model*</label>
              <select
                name="model"
                value={formData.model}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.model) setErrors(prev => ({ ...prev, model: '' }));
                }}
                className={`form-input w-full ${errors.model ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                disabled={!formData.make || loadingModels}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              {loadingModels && <span className="text-sm text-gray-500">Loading models...</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year*</label>
              <select
                name="year"
                value={formData.year}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.year) setErrors(prev => ({ ...prev, year: '' }));
                }}
                className={`form-input w-full ${errors.year ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
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
              className={`btn btn-primary transition-opacity ${loading || !isFormValid() ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
              disabled={loading || !isFormValid()}
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
