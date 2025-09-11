import { useState } from 'react';
import { X } from 'lucide-react';

interface DealershipCarFormProps {
  onSubmit: (car: {
    make: string;
    model: string;
    year: string;
    exactModel: string;
    price: number;
    image?: File;
  }) => void;
  onCancel: () => void;
  initialData?: {
    make: string;
    model: string;
    year: string;
    exactModel: string;
    price: number;
    imageUrl?: string;
  };
  isEdit?: boolean;
  dealershipId?: string;
}

const DealershipCarForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
  dealershipId
}: DealershipCarFormProps) => {
  const [formData, setFormData] = useState({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear().toString(),
    exactModel: initialData?.exactModel || '',
    price: initialData?.price || 0,
    dealershipId: dealershipId || ''
  });
  
  const [carImage, setCarImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Handle price as a number
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCarImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else {
      const yearNum = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }
    
    if (!formData.exactModel.trim()) {
      newErrors.exactModel = 'Exact model is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!isEdit && !carImage && !imagePreview) {
      newErrors.image = 'Car image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        image: carImage || undefined
      });
    }
  };

  // Generate year options for the dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEdit ? 'Edit Car' : 'Add New Car'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Make Field */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                Make*
              </label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.make ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter car make (e.g., Toyota, Honda)"
              />
              {errors.make && <p className="mt-1 text-sm text-red-500">{errors.make}</p>}
            </div>
            
            {/* Model Field */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model*
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter car model (e.g., Camry, Accord)"
              />
              {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
            </div>
            
            {/* Year Field */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year*
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
            </div>
            
            {/* Exact Model Field */}
            <div>
              <label htmlFor="exactModel" className="block text-sm font-medium text-gray-700 mb-1">
                Exact Model*
              </label>
              <input
                type="text"
                id="exactModel"
                name="exactModel"
                value={formData.exactModel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.exactModel ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter exact model/trim (e.g., SE, Limited, Sport)"
              />
              {errors.exactModel && <p className="mt-1 text-sm text-red-500">{errors.exactModel}</p>}
            </div>
            
            {/* Price Field */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (SAR)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter selling price"
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
            
            {/* Car Image Upload */}
            <div>
              <label htmlFor="carImage" className="block text-sm font-medium text-gray-700 mb-1">
                Car Picture{!isEdit && '*'}
              </label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative w-32 h-24 border rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Car preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCarImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="carImage"
                    name="carImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="carImage"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: High quality image showing the car clearly
                  </p>
                  {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none"
            >
              {isEdit ? 'Update Car' : 'Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealershipCarForm;
