import React from 'react';

type ConditionOption = {
  value: string;
  label: string;
  color: string;
};

type CarPartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partName: string | null;
  onSelectCondition: (condition: string) => void;
};

const CarPartModal: React.FC<CarPartModalProps> = ({
  isOpen,
  onClose,
  partName,
  onSelectCondition,
}) => {
  if (!isOpen) return null;

  const conditionOptions: ConditionOption[] = [
    { value: 'original', label: 'Original', color: '#4CAF50' },
    { value: 'painted', label: 'Painted', color: '#2196F3' },
    { value: 'repainted', label: 'Repainted', color: '#FFC107' },
    { value: 'damaged', label: 'Damaged', color: '#F44336' },
  ];

  const formatPartName = (name: string | null): string => {
    if (!name) return '';
    // Convert from format like 'c_n_wing_rear_left' to 'Rear Left Wing'
    return name
      .replace('c_n_', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{formatPartName(partName)}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="mb-4">Select the condition of this part:</p>
        
        <div className="grid grid-cols-2 gap-3">
          {conditionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelectCondition(option.value)}
              className="p-3 rounded-md flex flex-col items-center justify-center transition-all hover:scale-105"
              style={{ 
                backgroundColor: `${option.color}20`, // 20% opacity of the color
                borderLeft: `4px solid ${option.color}`
              }}
            >
              <div 
                className="w-4 h-4 rounded-full mb-2"
                style={{ backgroundColor: option.color }}
              />
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarPartModal;
