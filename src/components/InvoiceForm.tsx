import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save, X, FileText } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { InvoiceFormData, InvoiceItem, InvoiceRecipient, CarDetails } from '../types/invoice';
import { mockRecipients } from '../mock/invoiceData';
import { calculateInvoiceTotals } from '../mock/invoiceData';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  onPreview: (data: InvoiceFormData) => void;
  initialData?: Partial<InvoiceFormData>;
}

// Mock car data for selection
const mockCars = [
  { id: 'car1', make: 'Toyota', model: 'Camry', year: 2023, color: 'Silver', trim: 'SE', value: 120000 },
  { id: 'car2', make: 'Lexus', model: 'ES', year: 2024, color: 'White', trim: 'Premium', value: 195000 },
  { id: 'car3', make: 'BMW', model: '5 Series', year: 2024, color: 'Black', trim: 'M Sport', value: 280000 },
  { id: 'car4', make: 'Mercedes-Benz', model: 'E-Class', year: 2023, color: 'Blue', trim: 'AMG Line', value: 260000 },
  { id: 'car5', make: 'Audi', model: 'A6', year: 2024, color: 'Gray', trim: 'Premium Plus', value: 240000 },
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, onCancel, onPreview, initialData }) => {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const defaultValues: InvoiceFormData = {
    recipient: initialData?.recipient || { id: '', name: '', email: '', phone: '', address: '' },
    car: initialData?.car || { id: '', make: '', model: '', year: 0, color: '', trim: '' },
    items: initialData?.items || [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    dueDate: initialData?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    taxRate: initialData?.taxRate || 15,
    discount: initialData?.discount || 0,
    notes: initialData?.notes || '',
  };

  const { control, handleSubmit, watch, setValue, register, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch('items');
  const watchTaxRate = watch('taxRate');
  const watchDiscount = watch('discount') || 0;

  // Calculate totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  useEffect(() => {
    if (watchItems) {
      // Update each item's total based on quantity and unit price
      watchItems.forEach((item, index) => {
        const total = item.quantity * item.unitPrice;
        if (item.total !== total) {
          setValue(`items.${index}.total`, total);
        }
      });

      // Calculate invoice totals
      const calculatedTotals = calculateInvoiceTotals(
        watchItems,
        watchTaxRate,
        watchDiscount
      );
      
      setTotals(calculatedTotals);
    }
  }, [watchItems, watchTaxRate, watchDiscount, setValue]);

  const handleCarSelect = (selectedOption: any) => {
    setSelectedCar(selectedOption);
    
    if (selectedOption) {
      const car = mockCars.find(c => c.id === selectedOption.value);
      if (car) {
        setValue('car', {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          color: car.color,
          trim: car.trim
        });
        
        // Add car as first item if items are empty or only have default empty item
        if (watchItems.length === 1 && !watchItems[0].description) {
          setValue('items.0', {
            id: '1',
            description: `${car.make} ${car.model} ${car.year} - ${car.color} ${car.trim}`,
            quantity: 1,
            unitPrice: car.value,
            total: car.value
          });
        }
      }
    }
  };

  const addItem = () => {
    append({
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' })
      .format(amount)
      .replace('SAR', 'Riyal');
  };

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
  };

  const handlePreview = (data: InvoiceFormData) => {
    onPreview(data);
  };

  // Format recipient options for react-select
  const recipientOptions = mockRecipients.map(recipient => ({
    value: recipient.id,
    label: recipient.name
  }));

  // Format car options for react-select
  const carOptions = mockCars.map(car => ({
    value: car.id,
    label: `${car.make} ${car.model} (${car.year}) - ${car.color}`
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData?.recipient ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(handlePreview)}
            className="px-4 py-2 border border-blue-700 rounded-md text-blue-700 hover:bg-blue-50 flex items-center gap-1"
          >
            <FileText size={18} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center gap-1"
          >
            <Save size={18} />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Recipient Information</h3>
            <div className="border-t border-gray-200 pt-4">
              <Controller
                name="recipient"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Recipient
                    </label>
                    <Select
                      options={recipientOptions}
                      placeholder="Select a recipient..."
                      onChange={(option: any) => {
                        const recipient = mockRecipients.find(r => r.id === option.value);
                        if (recipient) {
                          setValue('recipient', recipient);
                        }
                      }}
                      className="basic-single"
                      classNamePrefix="select"
                    />
                  </div>
                )}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  {...register('recipient.name', { required: 'Name is required' })}
                  className="form-input w-full"
                  placeholder="Recipient name"
                />
                {errors.recipient?.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.recipient.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('recipient.email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="form-input w-full"
                  placeholder="Email address"
                />
                {errors.recipient?.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.recipient.email.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register('recipient.phone')}
                  className="form-input w-full"
                  placeholder="Phone number"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  {...register('recipient.address')}
                  className="form-textarea w-full"
                  rows={3}
                  placeholder="Recipient address"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Vehicle Information</h3>
            <div className="border-t border-gray-200 pt-4">
              <Controller
                name="car"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Vehicle
                    </label>
                    <Select
                      options={carOptions}
                      placeholder="Select a vehicle..."
                      value={selectedCar}
                      onChange={handleCarSelect}
                      className="basic-single"
                      classNamePrefix="select"
                    />
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    {...register('car.make', { required: 'Make is required' })}
                    className="form-input w-full"
                    placeholder="Vehicle make"
                  />
                  {errors.car?.make && (
                    <p className="text-red-500 text-xs mt-1">{errors.car.make.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    {...register('car.model', { required: 'Model is required' })}
                    className="form-input w-full"
                    placeholder="Vehicle model"
                  />
                  {errors.car?.model && (
                    <p className="text-red-500 text-xs mt-1">{errors.car.model.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    {...register('car.year', { 
                      required: 'Year is required',
                      min: {
                        value: 1900,
                        message: 'Year must be 1900 or later'
                      },
                      max: {
                        value: new Date().getFullYear() + 1,
                        message: `Year must be ${new Date().getFullYear() + 1} or earlier`
                      }
                    })}
                    className="form-input w-full"
                    placeholder="Year"
                  />
                  {errors.car?.year && (
                    <p className="text-red-500 text-xs mt-1">{errors.car.year.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    {...register('car.color')}
                    className="form-input w-full"
                    placeholder="Vehicle color"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trim
                  </label>
                  <input
                    {...register('car.trim')}
                    className="form-input w-full"
                    placeholder="Vehicle trim"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN (Optional)
                </label>
                <input
                  {...register('car.vin')}
                  className="form-input w-full"
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Invoice Items</h3>
          <div className="border-t border-gray-200 pt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Unit Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input
                          {...register(`items.${index}.description` as const, { 
                            required: 'Description is required' 
                          })}
                          className="form-input w-full"
                          placeholder="Item description"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">{errors.items[index]?.description?.message}</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          {...register(`items.${index}.quantity` as const, { 
                            required: 'Required',
                            min: {
                              value: 1,
                              message: 'Min 1'
                            }
                          })}
                          className="form-input w-full"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          {...register(`items.${index}.unitPrice` as const, { 
                            required: 'Required',
                            min: {
                              value: 0,
                              message: 'Min 0'
                            }
                          })}
                          className="form-input w-full"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          {...register(`items.${index}.total` as const)}
                          className="form-input w-full bg-gray-50"
                          disabled
                        />
                      </td>
                      <td className="px-4 py-2">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={addItem}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus size={18} className="mr-1" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Invoice Details</h3>
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date) => field.onChange(date.toISOString())}
                      className="form-input w-full"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                    />
                  )}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  {...register('taxRate', { 
                    required: 'Tax rate is required',
                    min: {
                      value: 0,
                      message: 'Tax rate must be 0 or greater'
                    },
                    max: {
                      value: 100,
                      message: 'Tax rate must be 100 or less'
                    }
                  })}
                  className="form-input w-full"
                  min="0"
                  max="100"
                  step="0.01"
                />
                {errors.taxRate && (
                  <p className="text-red-500 text-xs mt-1">{errors.taxRate.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount
                </label>
                <input
                  type="number"
                  {...register('discount', { 
                    min: {
                      value: 0,
                      message: 'Discount must be 0 or greater'
                    }
                  })}
                  className="form-input w-full"
                  min="0"
                  step="0.01"
                />
                {errors.discount && (
                  <p className="text-red-500 text-xs mt-1">{errors.discount.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  className="form-textarea w-full"
                  rows={3}
                  placeholder="Additional notes for the invoice"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Summary</h3>
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {watchDiscount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(watchDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax ({watchTaxRate}%):</span>
                  <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
                </div>
                
                <div className="flex justify-between py-3 font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-900">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>This invoice will be generated as a draft. You can preview, edit, and send it later.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
