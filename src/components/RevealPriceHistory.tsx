import React from 'react';
import { Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface RevealPriceHistoryProps {
  history: any[];
  loading?: boolean;
}

const fmtPrice = (v: any) => (v || v === 0) ? `SAR ${Number(v).toLocaleString()}` : '-';
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const RevealPriceHistory: React.FC<RevealPriceHistoryProps> = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Reveal Price History
        </h3>
        <div className="py-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto" />
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Reveal Price History</h3>
        <div className="text-gray-500 text-sm">No reveal price history available</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Reveal Price History
      </h3>

      <div className="space-y-3 max-h-[750px] overflow-y-auto pr-2">
        {history.map((his) => (
          <div
            key={his.id}
            className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-semibold text-gray-800">{fmtPrice(his.price)}</span>
              <StatusBadge status={his.status as any} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{fmtDate(his.createdAt)}</span>
              {his.isFinalOffer && (
                <span className="badge bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Final</span>
              )}
            </div>
            {his.note && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">{his.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealPriceHistory;
