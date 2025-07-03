import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, ArrowRight, Check, Camera, Upload, Star,
  Car, User, FileText, DollarSign, Send, Save,
  AlertTriangle, CheckCircle, X, Plus, Minus
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

const InspectionReport = () => {
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
    { number: 1, title: 'General Info', icon: FileText },
    { number: 2, title: 'Body', icon: Car },
    { number: 3, title: 'Engine', icon: AlertTriangle },
    { number: 4, title: 'Docs', icon: FileText },
    { number: 5, title: 'Submit', icon: DollarSign }
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Make:</span>
                  <span className="ml-2 font-medium">{vehicleData.make}</span>
                </div>
                <div>
                  <span className="text-blue-700">Model:</span>
                  <span className="ml-2 font-medium">{vehicleData.model}</span>
                </div>
                <div>
                  <span className="text-blue-700">Year:</span>
                  <span className="ml-2 font-medium">{vehicleData.year}</span>
                </div>
                <div>
                  <span className="text-blue-700">Color:</span>
                  <span className="ml-2 font-medium">{vehicleData.color}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Name
              </label>
              <input
                type="text"
                value={inspectionData.inspectorName}
                onChange={(e) => updateData('inspectorName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Date
              </label>
              <input
                type="date"
                value={inspectionData.inspectionDate}
                onChange={(e) => updateData('inspectionDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Location
              </label>
              <input
                type="text"
                value={inspectionData.location}
                onChange={(e) => updateData('location', e.target.value)}
                placeholder="Enter inspection location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Mileage (km)
              </label>
              <input
                type="number"
                value={inspectionData.mileage}
                onChange={(e) => updateData('mileage', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exterior Condition</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Exterior Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                    <button
                      key={condition}
                      onClick={() => updateData('exteriorCondition', condition)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inspectionData.exteriorCondition === condition
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`capitalize font-medium ${getConditionColor(condition)}`}>
                        {condition}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exterior Defects
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {exteriorDefectOptions.map((defect) => (
                    <button
                      key={defect}
                      onClick={() => toggleDefect('exteriorDefects', defect)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        inspectionData.exteriorDefects.includes(defect)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {defect}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exterior Notes
                </label>
                <textarea
                  value={inspectionData.exteriorNotes}
                  onChange={(e) => updateData('exteriorNotes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about exterior condition..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interior Condition</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Interior Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                    <button
                      key={condition}
                      onClick={() => updateData('interiorCondition', condition)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inspectionData.interiorCondition === condition
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`capitalize font-medium ${getConditionColor(condition)}`}>
                        {condition}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interior Defects
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interiorDefectOptions.map((defect) => (
                    <button
                      key={defect}
                      onClick={() => toggleDefect('interiorDefects', defect)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        inspectionData.interiorDefects.includes(defect)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {defect}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interior Notes
                </label>
                <textarea
                  value={inspectionData.interiorNotes}
                  onChange={(e) => updateData('interiorNotes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about interior condition..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engine & Mechanical</h3>
            
            <div className="space-y-4">
              {[
                { key: 'engineCondition', label: 'Engine Condition' },
                { key: 'transmissionCondition', label: 'Transmission' },
                { key: 'brakeCondition', label: 'Brakes' },
                { key: 'suspensionCondition', label: 'Suspension' },
                { key: 'tiresCondition', label: 'Tires' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => updateData(key as keyof InspectionData, condition)}
                        className={`p-2 text-xs rounded-lg border-2 transition-all ${
                          inspectionData[key as keyof InspectionData] === condition
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`capitalize font-medium ${getConditionColor(condition)}`}>
                          {condition}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mechanical Issues
              </label>
              <div className="grid grid-cols-2 gap-2">
                {mechanicalDefectOptions.map((defect) => (
                  <button
                    key={defect}
                    onClick={() => toggleDefect('mechanicalDefects', defect)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      inspectionData.mechanicalDefects.includes(defect)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {defect}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mechanical Notes
              </label>
              <textarea
                value={inspectionData.mechanicalNotes}
                onChange={(e) => updateData('mechanicalNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed notes about engine and mechanical condition..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation & History</h3>
            
            <div className="space-y-4">
              {[
                { key: 'registrationValid', label: 'Registration Valid' },
                { key: 'insuranceValid', label: 'Insurance Valid' },
                { key: 'serviceHistoryAvailable', label: 'Service History Available' },
                { key: 'accidentHistory', label: 'Accident History' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{label}</span>
                  <button
                    onClick={() => updateData(key as keyof InspectionData, !inspectionData[key as keyof InspectionData])}
                    className={`w-12 h-6 rounded-full transition-all ${
                      inspectionData[key as keyof InspectionData]
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      inspectionData[key as keyof InspectionData]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Previous Owners
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateData('ownershipHistory', Math.max(1, inspectionData.ownershipHistory - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold text-gray-900 w-8 text-center">
                  {inspectionData.ownershipHistory}
                </span>
                <button
                  onClick={() => updateData('ownershipHistory', inspectionData.ownershipHistory + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentation Notes
              </label>
              <textarea
                value={inspectionData.documentNotes}
                onChange={(e) => updateData('documentNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes about documentation, service history, accidents, etc..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valuation & Final Assessment</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Value (SAR)
                </label>
                <input
                  type="number"
                  value={inspectionData.marketValue}
                  onChange={(e) => updateData('marketValue', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Price (SAR)
                </label>
                <input
                  type="number"
                  value={inspectionData.recommendedPrice}
                  onChange={(e) => updateData('recommendedPrice', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating ({inspectionData.overallRating}/5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateData('overallRating', rating)}
                    className="p-2"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Recommendation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'approve', label: 'Approve', color: 'green' },
                  { value: 'conditional', label: 'Conditional', color: 'yellow' },
                  { value: 'reject', label: 'Reject', color: 'red' }
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => updateData('finalRecommendation', value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      inspectionData.finalRecommendation === value
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-medium ${
                      inspectionData.finalRecommendation === value
                        ? `text-${color}-700`
                        : 'text-gray-700'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Images
              </label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 font-medium">Upload images</span>
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
                  <div className="grid grid-cols-3 gap-2">
                    {inspectionData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Inspection ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Notes
              </label>
              <textarea
                value={inspectionData.finalNotes}
                onChange={(e) => updateData('finalNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Final summary and recommendations..."
              />
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
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
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
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between">
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
    </div>
  );
};

export default InspectionReport;