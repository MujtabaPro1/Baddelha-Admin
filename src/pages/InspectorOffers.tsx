import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { RefreshCw, Check, X, AlertTriangle, Car as CarIcon, User, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  findMyOffers,
  sellerAcceptedOffer,
  sellerRejectedOffer,
} from '../service/priceReveal';
import { PriceReveal, PRICE_REVEAL_STATUS } from '../types/priceReveal';

const TABS: { id: string; label: string }[] = [
  { id: '', label: 'All' },
  { id: PRICE_REVEAL_STATUS.Pending, label: 'Pending' },
  { id: PRICE_REVEAL_STATUS.RejectedBySeller, label: 'Rejected By Seller' },
  { id: PRICE_REVEAL_STATUS.Accepted, label: 'Accepted' },
  { id: PRICE_REVEAL_STATUS.Discarded, label: 'Discarded' },
];

const fmtPrice = (v: any) => (v || v === 0) ? `SAR ${Number(v).toLocaleString()}` : '-';
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
const imgSrc = (path?: string | null) => (path && /^https?:\/\//.test(path)) ? path : null;

const InspectorOffers = () => {
  const [activeTab, setActiveTab] = useState('');
  const [offers, setOffers] = useState<PriceReveal[]>([]);
  const [loading, setLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingOffer, setRejectingOffer] = useState<PriceReveal | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await findMyOffers(activeTab || undefined);
      setOffers(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offer: PriceReveal) => {
    if (!confirm(`Confirm that the seller accepted the offer of ${fmtPrice(offer.price)}?`)) return;
    setAcceptingId(offer.id);
    try {
      await sellerAcceptedOffer(offer.id);
      toast.success('Offer marked as accepted by seller');
      fetchOffers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record acceptance');
    } finally {
      setAcceptingId(null);
    }
  };

  const openRejectModal = (offer: PriceReveal) => {
    setRejectingOffer(offer);
    setRejectNote('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingOffer) return;
    setRejecting(true);
    try {
      await sellerRejectedOffer(rejectingOffer.id, rejectNote ? { note: rejectNote } : undefined);
      toast.success(
        rejectingOffer.isFinalOffer
          ? 'Offer rejected — deal has been closed'
          : 'Offer rejected — sent back to QA for revision'
      );
      setShowRejectModal(false);
      fetchOffers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record rejection');
    } finally {
      setRejecting(false);
    }
  };

  const carLabel = (car: any) => car ? `${car.modelYear || ''} ${car.make || ''} ${car.model || ''}`.trim() : '-';

  return (
    <div>
      <PageHeader
        title="My Offers"
        description="Price offers assigned to you for presentation to sellers"
        actions={
          <button
            onClick={fetchOffers}
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => {
          const car = offer.Car || offer.car;
          const photo = imgSrc(offer.carFrontImage);
          return (
            <div key={offer.id} className="card p-6 hover:shadow-md animated-transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt="car" className="h-16 w-24 object-cover rounded-md" />
                    ) : (
                      <div className="h-16 w-24 rounded-md bg-gray-100 flex items-center justify-center">
                        <CarIcon size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={offer.status as any} />
                      {offer.isFinalOffer && (
                        <span className="badge bg-purple-100 text-purple-800">Final Offer</span>
                      )}
                      {car?.serialNo != null && (
                        <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                          Car #{car.serialNo}
                        </span>
                      )}
                      {offer.bookingSerialNo != null && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Hash size={10} /> Booking {offer.bookingSerialNo}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-2 flex items-center gap-2">
                      <CarIcon size={16} className="text-gray-400" />
                      {carLabel(car)}
                    </h3>
                    {offer.customerName && (
                      <div className="mt-1 flex items-center text-sm text-gray-600 gap-1">
                        <User className="h-4 w-4" />
                        <span>{offer.customerName}</span>
                      </div>
                    )}
                    <p className="text-xl font-bold text-blue-900 mt-1">{fmtPrice(offer.price)}</p>
                    {offer.note && (
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded p-2 max-w-md">{offer.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Created: {fmtDate(offer.createdAt)}</p>
                  </div>
                </div>

                {offer.status === PRICE_REVEAL_STATUS.Pending && (
                  <div className="flex flex-col gap-2 md:items-end flex-shrink-0">
                    <button
                      onClick={() => handleAccept(offer)}
                      disabled={acceptingId === offer.id}
                      className="btn btn-sm min-w-[175px] justify-center bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check size={14} /> Seller Accepted
                    </button>
                    <button
                      onClick={() => openRejectModal(offer)}
                      className="btn btn-sm min-w-[175px] justify-center btn-danger flex items-center gap-1"
                    >
                      <X size={14} /> Seller Rejected
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && offers.length === 0 && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No offers found.</p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && rejectingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Seller Rejected Offer</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {rejectingOffer.isFinalOffer && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    This is a final offer. Rejecting it will permanently close the deal for this car.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="e.g. Seller wants 90k minimum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {rejecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorOffers;
