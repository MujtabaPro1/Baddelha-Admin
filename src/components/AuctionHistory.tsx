import React from 'react';
import { Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

interface AuctionHistoryProps {
  auctions: any[];
}

const fmt = (x: number) => x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0';

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AuctionHistory: React.FC<AuctionHistoryProps> = ({ auctions }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <div className="p-1.5 bg-[#003B7E]/10 rounded-lg">
          <Clock size={14} className="text-[#003B7E]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Auction History</h3>
        {auctions?.length > 0 && (
          <span className="ml-auto text-xs font-semibold bg-[#003B7E]/10 text-[#003B7E] px-2 py-0.5 rounded-full">
            {auctions.length}
          </span>
        )}
      </div>

      {!auctions || auctions.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Clock size={28} className="mx-auto text-gray-200 mb-2" />
          <p className="text-xs text-gray-400">No auction history available</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
          {auctions.map((auction, index) => {
            const gain = (auction.highestBid || auction.startPrice) - auction.startPrice;
            const gainPct = auction.startPrice > 0 ? ((gain / auction.startPrice) * 100).toFixed(1) : '0';
            const isActive = auction.status === 'ACTIVE';
            const isEnded  = auction.status === 'ENDED';

            return (
              <div
                key={auction.id}
                onClick={() => { window.location.href = '/cars/details/' + auction.carId + '?auctionId=' + auction.id; }}
                className="px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                {/* Row 1: title + status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      Auction #{auctions.length - index}
                    </span>
                    <ArrowUpRight size={13} className="text-gray-300 group-hover:text-[#003B7E] transition-colors" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-100 text-emerald-700'
                    : isEnded ? 'bg-slate-100 text-slate-500'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {auction.status}
                  </span>
                </div>

                {/* Row 2: date */}
                <p className="text-xs text-gray-400 mb-3">
                  {formatDate(auction.startTime)} — {new Date(auction.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Row 3: prices */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">Start Price</p>
                    <p className="text-sm font-semibold text-gray-700">SAR {fmt(auction.startPrice)}</p>
                  </div>
                  <div className="bg-[#003B7E]/5 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs text-[#003B7E]/60">Highest Bid</p>
                      {gain > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                          <TrendingUp size={10} /> +{gainPct}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#003B7E]">SAR {fmt(auction.highestBid || auction.startPrice)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuctionHistory;
