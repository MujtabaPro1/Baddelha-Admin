import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, ArrowRight, Check, Camera, Upload, Star,
  Car, User, FileText, DollarSign, Send, Save,
  AlertTriangle, CheckCircle, X, Plus, Minus, ChevronDown
} from 'lucide-react';

interface InspectionData {
  // General Information
  inspectorName: string;
  inspectionDate: string;
  location: string;
  mileage: number;
  
  // Vehicle Details
  exteriorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  interiorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  exteriorDefects: string[];
  interiorDefects: string[];
  exteriorNotes: string;
  interiorNotes: string;
  
  // Engine & Mechanical
  engineCondition: 'excellent' | 'good' | 'fair' | 'poor';
  transmissionCondition: 'excellent' | 'good' | 'fair' | 'poor';
  brakeCondition: 'excellent' | 'good' | 'fair' | 'poor';
  suspensionCondition: 'excellent' | 'good' | 'fair' | 'poor';
  tiresCondition: 'excellent' | 'good' | 'fair' | 'poor';
  mechanicalDefects: string[];
  mechanicalNotes: string;
  
  // Documentation
  registrationValid: boolean;
  insuranceValid: boolean;
  serviceHistoryAvailable: boolean;
  accidentHistory: boolean;
  ownershipHistory: number;
  documentNotes: string;
  
  // Valuation & Final
  marketValue: number;
  recommendedPrice: number;
  overallRating: number;
  finalRecommendation: 'approve' | 'conditional' | 'reject';
  finalNotes: string;
  images: File[];
}

const MobileInspection = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    inspectorName: user?.name || '',
    inspectionDate: new Date().toISOString().split('T')[0],
    location: '',
    mileage: 0,
    exteriorCondition: 'good',
    interiorCondition: 'good',
    exteriorDefects: [],
    interiorDefects: [],
    exteriorNotes: '',
    interiorNotes: '',
    engineCondition: 'good',
    transmissionCondition: 'good',
    brakeCondition: 'good',
    suspensionCondition: 'good',
    tiresCondition: 'good',
    mechanicalDefects: [],
    mechanicalNotes: '',
    registrationValid: true,
    insuranceValid: true,
    serviceHistoryAvailable: true,
    accidentHistory: false,
    ownershipHistory: 1,
    documentNotes: '',
    marketValue: 0,
    recommendedPrice: 0,
    overallRating: 4,
    finalRecommendation: 'approve',
    finalNotes: '',
    images: []
  });

  // Mock vehicle data
  const vehicleData = {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'White',
    vin: 'JTDKARFP0N0123456',
    customerName: 'Ahmed Mohammed',
    customerPhone: '+966 50 123 4567'
  };

  const steps = [
    { number: 1, title: 'Contact Information', icon: User },
    { number: 2, title: 'Vehicle Information', icon: Car },
    { number: 3, title: 'Condition Assessment', icon: AlertTriangle },
    { number: 4, title: 'Documentation', icon: FileText },
    { number: 5, title: 'Final Report', icon: DollarSign }
  ];

  const exteriorDefectOptions = [
    'Scratches', 'Dents', 'Rust', 'Paint damage', 'Bumper damage',
    'Headlight damage', 'Taillight damage', 'Mirror damage', 'Windshield crack'
  ];

  const interiorDefectOptions = [
    'Seat wear', 'Dashboard cracks', 'Carpet stains', 'Electronics malfunction',
    'AC issues', 'Steering wheel wear', 'Door panel damage', 'Console damage'
  ];

  const mechanicalDefectOptions = [
    'Engine noise', 'Oil leaks', 'Coolant leaks', 'Brake issues',
    'Transmission problems', 'Suspension noise', 'Tire wear', 'Exhaust issues'
  ];

  const updateData = (field: keyof InspectionData, value: any) => {
    setInspectionData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDefect = (category: 'exteriorDefects' | 'interiorDefects' | 'mechanicalDefects', defect: string) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: prev[category].includes(defect)
        ? prev[category].filter(d => d !== defect)
        : [...prev[category], defect]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setInspectionData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setInspectionData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Submitting inspection:', inspectionData);
    setIsSubmitting(false);
    navigate('/inspections');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white p-4">
            {/* Header Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-green-800 text-sm">Fields with * are required.</span>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *First Name:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={inspectionData.inspectorName.split(' ')[0] || ''}
                        onChange={(e) => {
                          const lastName = inspectionData.inspectorName.split(' ').slice(1).join(' ');
                          updateData('inspectorName', `${e.target.value} ${lastName}`.trim());
                        }}
                        placeholder="First Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *Last Name:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={inspectionData.inspectorName.split(' ').slice(1).join(' ') || ''}
                        onChange={(e) => {
                          const firstName = inspectionData.inspectorName.split(' ')[0] || '';
                          updateData('inspectorName', `${firstName} ${e.target.value}`.trim());
                        }}
                        placeholder="Last Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Middle Name:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Middle Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *E-mail:
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      *Phone:
                    </label>
                    <div className="flex">
                      <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-l-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="+971">+971</option>
                          <option value="+966">+966</option>
                          <option value="+1">+1</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white p-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Vehicle Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *Make:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Make</option>
                        <option value="toyota">Toyota</option>
                        <option value="honda">Honda</option>
                        <option value="nissan">Nissan</option>
                        <option value="mercedes">Mercedes-Benz</option>
                        <option value="bmw">BMW</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *Model:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Model</option>
                        <option value="camry">Camry</option>
                        <option value="corolla">Corolla</option>
                        <option value="accord">Accord</option>
                        <option value="civic">Civic</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *Model Year:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Model Year</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      VIN:
                    </label>
                    <input
                      type="text"
                      placeholder="VIN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Engine:
                    </label>
                    <input
                      type="text"
                      placeholder="Engine"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      *Mileage:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Mileage</option>
                        <option value="0-10000">0 - 10,000 km</option>
                        <option value="10000-50000">10,000 - 50,000 km</option>
                        <option value="50000-100000">50,000 - 100,000 km</option>
                        <option value="100000+">100,000+ km</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Gear Type:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Gear Type</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                        <option value="cvt">CVT</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Body Type:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Body Type</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="coupe">Coupe</option>
                        <option value="pickup">Pickup</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Car Color:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Car Color</option>
                        <option value="white">White</option>
                        <option value="black">Black</option>
                        <option value="silver">Silver</option>
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Engine Type:
                    </label>
                    <div className="relative">
                      <select className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Select a Engine Type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white p-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Condition Assessment</h2>
                
                <div className="space-y-8">
                  {/* Exterior Condition */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Exterior Condition</h3>
                    
                    <div className="mb-6">
                      <label className="block text-sm text-gray-700 mb-3">
                        Overall Exterior Condition
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                          <button
                            key={condition}
                            onClick={() => updateData('exteriorCondition', condition)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              inspectionData.exteriorCondition === condition
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <span className="capitalize font-medium">{condition}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm text-gray-700 mb-3">
                        Exterior Defects (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {exteriorDefectOptions.map((defect) => (
                          <button
                            key={defect}
                            onClick={() => toggleDefect('exteriorDefects', defect)}
                            className={`p-3 text-sm rounded-lg border transition-all text-center ${
                              inspectionData.exteriorDefects.includes(defect)
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {defect}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Exterior Notes
                      </label>
                      <textarea
                        value={inspectionData.exteriorNotes}
                        onChange={(e) => updateData('exteriorNotes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="Additional notes about exterior condition..."
                      />
                    </div>
                  </div>

                  {/* Interior Condition */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Interior Condition</h3>
                    
                    <div className="mb-6">
                      <label className="block text-sm text-gray-700 mb-3">
                        Overall Interior Condition
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                          <button
                            key={condition}
                            onClick={() => updateData('interiorCondition', condition)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              inspectionData.interiorCondition === condition
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <span className="capitalize font-medium">{condition}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm text-gray-700 mb-3">
                        Interior Defects (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {interiorDefectOptions.map((defect) => (
                          <button
                            key={defect}
                            onClick={() => toggleDefect('interiorDefects', defect)}
                            className={`p-3 text-sm rounded-lg border transition-all text-center ${
                              inspectionData.interiorDefects.includes(defect)
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {defect}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Interior Notes
                      </label>
                      <textarea
                        value={inspectionData.interiorNotes}
                        onChange={(e) => updateData('interiorNotes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="Additional notes about interior condition..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white p-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Documentation & History</h2>
                
                <div className="space-y-6">
                  {[
                    { key: 'registrationValid', label: 'Registration Valid' },
                    { key: 'insuranceValid', label: 'Insurance Valid' },
                    { key: 'serviceHistoryAvailable', label: 'Service History Available' },
                    { key: 'accidentHistory', label: 'Accident History' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{label}</span>
                      <button
                        onClick={() => updateData(key as keyof InspectionData, !inspectionData[key as keyof InspectionData])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          inspectionData[key as keyof InspectionData]
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          inspectionData[key as keyof InspectionData]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm text-gray-700 mb-3">
                      Number of Previous Owners
                    </label>
                    <div className="flex items-center justify-center space-x-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        onClick={() => updateData('ownershipHistory', Math.max(1, inspectionData.ownershipHistory - 1))}
                        className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                        {inspectionData.ownershipHistory}
                      </span>
                      <button
                        onClick={() => updateData('ownershipHistory', inspectionData.ownershipHistory + 1)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Documentation Notes
                    </label>
                    <textarea
                      value={inspectionData.documentNotes}
                      onChange={(e) => updateData('documentNotes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Notes about documentation, service history, accidents, etc..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white p-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Final Report & Valuation</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Market Value (SAR)
                      </label>
                      <input
                        type="number"
                        value={inspectionData.marketValue}
                        onChange={(e) => updateData('marketValue', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Recommended Price (SAR)
                      </label>
                      <input
                        type="number"
                        value={inspectionData.recommendedPrice}
                        onChange={(e) => updateData('recommendedPrice', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-3">
                      Overall Rating ({inspectionData.overallRating}/5)
                    </label>
                    <div className="flex justify-center space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => updateData('overallRating', rating)}
                          className="p-2 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              rating <= inspectionData.overallRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-3">
                      Final Recommendation
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'approve', label: 'Approve', color: 'green' },
                        { value: 'conditional', label: 'Conditional', color: 'yellow' },
                        { value: 'reject', label: 'Reject', color: 'red' }
                      ].map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => updateData('finalRecommendation', value)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            inspectionData.finalRecommendation === value
                              ? color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                                color === 'yellow' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                                'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Inspection Images
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 font-medium hover:text-blue-500">Upload images</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Take photos of exterior, interior, engine, and any defects
                        </p>
                      </div>
                      
                      {inspectionData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {inspectionData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Inspection ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Final Notes
                    </label>
                    <textarea
                      value={inspectionData.finalNotes}
                      onChange={(e) => updateData('finalNotes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Final summary and recommendations..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/inspections')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Vehicle Inspection
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`text-xs font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Save Button */}
      <div className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <button className="w-full bg-gray-200 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20" />

      {/* Footer */}
      <div className="bg-white border-t py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Baddelha.com - 2025 © All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileInspection;