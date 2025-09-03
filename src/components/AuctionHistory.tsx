import React from 'react';
import { Clock, DollarSign, Calendar } from 'lucide-react';

interface AuctionHistoryProps {
  auctions: any[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const AuctionHistory: React.FC<AuctionHistoryProps> = ({ auctions }) => {
  if (!auctions || auctions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Auction History</h3>
        <div className="text-gray-500 text-sm">No auction history available</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Auction History
      </h3>
      
      <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
        {auctions.map((auction, index) => (
          <div 
            key={auction.id} 
            className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-2">
                  <Calendar className="w-4 h-4 text-blue-900" />
                </div>
                <div>
                  <div className="text-sm font-medium">Auction #{auctions.length - index}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(auction.startTime)} - {formatDate(auction.endTime)}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                auction.status === 'ENDED' ? 'bg-blue-100 text-blue-800' : 
                auction.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {auction.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Start Price</div>
                <div className="font-medium flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  SAR {numberWithCommas(auction.startPrice)}
                </div>
              </div>
              
              <div>
                <div className="text-gray-500 text-xs">Highest Bid</div>
                <div className="font-medium text-blue-900 flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  SAR {numberWithCommas(auction.highestBid || auction.startPrice)}
                </div>
              </div>
            </div>
            
            {auction.coverImage && (
              <div className="mt-2">
                <img 
                  src={auction.coverImage} 
                  alt="Car" 
                  className="w-full h-[250px] object-cover rounded-md"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionHistory;
