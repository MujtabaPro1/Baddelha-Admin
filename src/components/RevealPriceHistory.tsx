import React from 'react';
import { Clock } from 'lucide-react';

interface ReavealPriceHistoryProps {
  history: any[];
}


const ReavealPriceHistory: React.FC<ReavealPriceHistoryProps> = ({ history }) => {

  if (!history || history.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Reaveal Price History</h3>
        <div className="text-gray-500 text-sm">No reveal price history available</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Reaveal Price History
      </h3>
      
      <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
        {history.map((his, index) => (
          <div 
            key={his.id} 
            onClick={() => {
      
            }}
            className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
             
            </div>
            
       
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReavealPriceHistory;
