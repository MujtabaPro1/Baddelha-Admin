import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: string) => void;
  isLoading: boolean;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  isLoading
}) => {
  const { language } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {language === 'en' ? 'Select Report Language' : 'اختر لغة التقرير'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelectLanguage('en')}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-md flex items-center justify-between hover:bg-gray-50"
          >
            <span>English</span>
            {language === 'en' && <span className="text-blue-900">●</span>}
          </button>
          
          {/* <button
            onClick={() => onSelectLanguage('ar')}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-md flex items-center justify-between hover:bg-gray-50"
          >
            <span>العربية</span>
            {language === 'ar' && <span className="text-blue-900">●</span>}
          </button> */}
        </div>
        
        {isLoading && (
          <div className="mt-4 text-center text-blue-900">
            {language === 'en' ? 'Generating Report...' : 'جاري إنشاء التقرير...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelectionModal;
