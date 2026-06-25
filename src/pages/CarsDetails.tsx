import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';
import {
  Check, X, Clock, ArrowUp, Clock10, DollarSign,
  Trophy, Car, Gauge, Cog, Calendar,
  Tag, Pencil, Eye, Ban, Package, RotateCcw, Bookmark,
} from 'lucide-react';
import CarBodySvgView from '../components/CarBodyView';
import AuctionHistory from '../components/AuctionHistory';
import RevealPriceHistory from '../components/RevealPriceHistory';

const fmt = (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  available:         { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  listed:            { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  sold:              { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  inspected:         { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  unlisted:          { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  hold:              { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  returned:          { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  push_to_inventory: { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
  push_to_auction:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  pending:           { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  pending_inspection:{ bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  rejected:          { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = statusConfig[status?.toLowerCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
};

const PriceModal = ({
  title, label, value, onChange, onSave, onClose, saving, coverImage, car,
}: {
  title: string; label: string; value: number | null;
  onChange: (v: number) => void; onSave: () => void; onClose: () => void;
  saving: boolean; coverImage: string | null; car: any;
}) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <X size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          {coverImage ? (
            <img src={coverImage} alt="car" className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <Car size={24} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{car?.make} {car?.model}</p>
            <p className="text-sm text-gray-500">{car?.modelYear}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">SAR</span>
            <input
              type="number"
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003B7E] text-sm"
              value={value || ''}
              onChange={e => onChange(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#003B7E] text-white text-sm font-medium rounded-xl hover:bg-[#002d61] transition-colors disabled:opacity-50"
          >
            {saving ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Saving…</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TABS = [
  { id: 'details',    label: 'Car Details' },
  { id: 'inspection', label: 'Inspection Report' },
  { id: 'bids',       label: 'Bids' },
  { id: 'images',     label: 'Images' },
];

const CarsDetails = () => {
  const [carDetails, setCarDetails]                         = useState<any>(null);
  const [images, setImages]                                 = useState<any>([]);
  const [inspectionDetails, setInspectionDetails]           = useState<any>(null);
  const [inspectionSchema, setInspectionSchema]             = useState<any>(null);
  const [loading, setLoading]                               = useState<boolean>(true);
  const [error, setError]                                   = useState<string | null>(null);
  const [activeTab, setActiveTab]                           = useState<string>('details');
  const [timeRemaining, setTimeRemaining]                   = useState(30 * 60);
  const [user, setUser]                                     = useState<any>(null);
  const [bidAmount, setBidAmount]                           = useState<number | null>(null);
  const [placingBid, setPlacingBid]                         = useState<boolean>(false);
  const [winner, setWinner]                                 = useState<any>(null);
  const [loadingWinner, setLoadingWinner]                   = useState<boolean>(false);
  const params = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const [bids, setBids]                                     = useState<any>([]);
  const [auctionHistory, setAuctionHistory]                 = useState<any>([]);
  const [showPriceModal, setShowPriceModal]                 = useState<boolean>(false);
  const [editedPrice, setEditedPrice]                       = useState<number | null>(null);
  const [updatingPrice, setUpdatingPrice]                   = useState<boolean>(false);
  const [coverImage, setCoverImage]                         = useState<any>(null);
  const [showRevealPriceModal, setShowRevealPriceModal]     = useState<boolean>(false);
  const [revealPrice, setRevealPrice]                       = useState<number | null>(null);
  const [editedSellerAskingPrice, setEditedSellerAskingPrice] = useState<number | null>(null);
  const [updatingSellerAskingPrice, setUpdatingSellerAskingPrice] = useState<boolean>(false);
  const [showSellerAskingPriceModal, setShowSellerAskingPriceModal] = useState<boolean>(false);
  const [editedRetailValue, setEditedRetailValue]           = useState<number | null>(null);
  const [updatingRetailValue, setUpdatingRetailValue]       = useState<boolean>(false);
  const [showRetailValueModal, setShowRetailValueModal]     = useState<boolean>(false);
  const [showAuctionModal, setShowAuctionModal]                     = useState<boolean>(false);
  const [auctionStartPrice, setAuctionStartPrice]                   = useState<number | null>(null);
  const [pushingToAuction, setPushingToAuction]                     = useState<boolean>(false);
  const [viewerOpen, setViewerOpen]                                 = useState<boolean>(false);
  const [viewerIndex, setViewerIndex]                               = useState<number>(0);

  useEffect(() => {
    if (carDetails?.sellingPrice)      setEditedPrice(Number(carDetails.sellingPrice));
    if (carDetails?.sellerAskingPrice) setEditedSellerAskingPrice(Number(carDetails.sellerAskingPrice));
    if (carDetails?.retailValue)       setEditedRetailValue(Number(carDetails.retailValue));
  }, [carDetails]);

  useEffect(() => {
    const ud = localStorage.getItem('baddelha_user');
    if (ud) setUser(JSON.parse(ud));
  }, []);

  useEffect(() => {
    fetchCarDetails();
    const auctionId = searchParams.get('auctionId');
    if (auctionId) {
      fetchAuctionWinner(auctionId);
      fetchAuctionBids(auctionId);
      const iv = setInterval(() => {
        fetchAuctionWinner(auctionId);
        fetchAuctionBids(auctionId);
      }, 60000);
      return () => clearInterval(iv);
    } else {
      getAuctionDetails();
    }
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) { toast.warning('Time limit reached'); return; }
    const iv = window.setInterval(() => setTimeRemaining(p => p - 1), 1000);
    return () => window.clearInterval(iv);
  }, [timeRemaining]);

  const getAuctionDetails = async () => {
    try {
      const resp = await axiosInstance.get('/1.0/auction?status=ENDED&carId=' + params.id);
      if (resp.data?.data && Array.isArray(resp.data?.data)) setAuctionHistory(resp.data.data);
    } catch { toast.error('Failed to load auction details'); }
  };

  async function fetchCarDetails() {
    setLoading(true);
    try {
      const resp = await axiosInstance.get('/1.0/car/find/' + params.id);
      setCarDetails(resp.data.car);
      setInspectionDetails(resp.data.car?.Inspection?.[0]);
      setInspectionSchema(resp.data.car?.Inspection?.[0]?.inspectionJson);
      setCoverImage(resp?.data?.carImages?.[0]?.url);
      if (!searchParams.get('auctionId')) setBids(resp.data.car?.Bid);
      if (resp.data?.images) setImages(resp.data.images);
    } catch { toast.error('Failed to load car details'); setError('Failed to load car details'); }
    finally { setLoading(false); }
  }

  async function fetchAuctionBids(auctionId: string) {
    try {
      const r = await axiosInstance.get(`/1.0/auction/${auctionId}/bids`);
      setBids(r.data);
    } catch {}
  }

  const fetchAuctionWinner = async (auctionId: string) => {
    setLoadingWinner(true);
    try {
      const r = await axiosInstance.get(`/1.0/auction/${auctionId}/winner`);
      setWinner(r.data);
    } catch {}
    finally { setLoadingWinner(false); }
  };

  const markCarAsListed = async (carId: string) => {
    try {
      await axiosInstance.put('/1.0/car/update/' + carId, { carStatus: 'listed', auctionEndTime: null });
      alert('Successfully updated your status');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) { toast.error(e?.message || 'Something went wrong'); }
  };

  const markCarAsInventory = async (carId: string) => {
    try {
      await axiosInstance.post(`/1.0/car/${carId}/push/inventory`);
      alert('Successfully pushed car to inventory');
      setTimeout(() => { window.location.href = '/cars'; }, 1000);
    } catch (e: any) { alert(e?.response?.data?.message || 'Something went wrong'); }
  };

  const openAuctionModal = () => {
    setAuctionStartPrice(Number(carDetails?.sellingPrice) || null);
    setShowAuctionModal(true);
  };

  const submitAuction = async () => {
    if (!carDetails?.id || !auctionStartPrice) return;
    const minPrice = Number(carDetails?.sellingPrice) || 0;
    if (auctionStartPrice < minPrice) {
      toast.error(`Start price cannot be below selling price (SAR ${fmt(minPrice)})`);
      return;
    }
    try {
      setPushingToAuction(true);
      await axiosInstance.post('/1.0/auction/push', {
        carId: carDetails.id, startPrice: auctionStartPrice, durationInMinutes: 30,
      });
      toast.success('Successfully pushed car to auction');
      setShowAuctionModal(false);
      setTimeout(() => { window.location.href = '/cars'; }, 1000);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Something went wrong'); }
    finally { setPushingToAuction(false); }
  };

  const updateCarPrice = async () => {
    if (!carDetails?.id || !editedPrice) return;
    try {
      setUpdatingPrice(true);
      await axiosInstance.put('/1.0/car/update/' + carDetails.id, { sellingPrice: editedPrice.toString() });
      toast.success('Price updated successfully');
      setCarDetails({ ...carDetails, sellingPrice: editedPrice });
      setShowPriceModal(false);
      fetchCarDetails();
    } catch (e: any) { toast.error(e?.message || 'Failed to update price'); }
    finally { setUpdatingPrice(false); }
  };

  const updateSellerAskingPrice = async () => {
    if (!carDetails?.id || !editedSellerAskingPrice) return;
    try {
      setUpdatingSellerAskingPrice(true);
      await axiosInstance.patch('/1.0/car/seller-price/' + carDetails.id, { price: editedSellerAskingPrice.toString() });
      toast.success('Seller asking price updated successfully');
      setCarDetails({ ...carDetails, sellerAskingPrice: editedSellerAskingPrice });
      setShowSellerAskingPriceModal(false);
      fetchCarDetails();
    } catch (e: any) { toast.error(e?.message || 'Failed to update seller asking price'); }
    finally { setUpdatingSellerAskingPrice(false); }
  };

  const updateRetailValue = async () => {
    if (!carDetails?.id || !editedRetailValue) return;
    try {
      setUpdatingRetailValue(true);
      await axiosInstance.put('/1.0/car/update/' + carDetails.id, { retailValue: editedRetailValue.toString() });
      toast.success('Internal value updated successfully');
      setCarDetails({ ...carDetails, retailValue: editedRetailValue });
      setShowRetailValueModal(false);
      fetchCarDetails();
    } catch (e: any) { toast.error(e?.message || 'Failed to update internal value'); }
    finally { setUpdatingRetailValue(false); }
  };

  const markCarStatus = async (carId: string, status: string) => {
    try {
      await axiosInstance.put('/1.0/car/update/' + carId, { carStatus: status });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) { toast.error(e?.message || 'Something went wrong'); }
  };

  const removeCarStatusFromAuction = async (auctionId: string) => {
    try {
      await axiosInstance.post('/1.0/auction/close/' + auctionId, { closeReason: 'User requested to close the auction' });
      alert('Successfully removed car from auction');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) { toast.error(e?.message || 'Something went wrong'); }
  };

  const placeInternalBid = async () => {
    if (!carDetails?.id || !bidAmount) return;
    try {
      setPlacingBid(true);
      const auctionId = searchParams.get('auctionId') || '';
      await axiosInstance.post(`/1.0/auction/${auctionId}/bid`, { amount: bidAmount });
      alert(`Your bid of SAR ${fmt(bidAmount)} has been submitted successfully!`);
      window.location.reload();
    } catch (e: any) {
      alert(`Failed to submit bid: ${e.response?.data?.message || 'Please try again later'}`);
    } finally { setPlacingBid(false); }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003B7E]" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-xl">
        <h3 className="font-semibold">Error</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const canPush = ['inspected', 'unlisted', 'push_to_inventory'].includes(carDetails?.carStatus);
  const canUnlist = ['listed', 'hold', 'sold', 'returned', 'push_to_auction'].includes(carDetails?.carStatus);
  const isAdmin = user?.role === 'admin' || user?.role === 'qa';
  const auctionId = searchParams.get('auctionId');
  const highestBid = bids?.length > 0 ? Math.max(...bids.map((b: any) => b.amount)) : 0;

  const specs = [
    { label: 'Make',      value: carDetails?.make,                             icon: <Car size={16} /> },
    { label: 'Model',     value: carDetails?.model,                            icon: <Car size={16} /> },
    { label: 'Year',      value: carDetails?.modelYear,                        icon: <Calendar size={16} /> },
    { label: 'Mileage',   value: carDetails?.exactMileage ? `${Number(carDetails.exactMileage).toLocaleString()} km` :  carDetails?.mileage ? `${carDetails.mileage.toLocaleString()} km` : 'N/A', icon: <Gauge size={16} /> },
    { label: 'Body Type', value: carDetails?.bodyType || 'N/A',               icon: <Car size={16} /> },
    { label: 'Engine',    value: carDetails?.engine || carDetails?.engineType || 'N/A', icon: <Cog size={16} /> },
    { label: 'Gear Type', value: carDetails?.gearType || 'N/A',               icon: <Cog size={16} /> },
    { label: 'Color',     value: carDetails?.color || 'N/A',                  icon: <Tag size={16} /> },
  ].filter(s => s.value && s.value !== 'N/A');

  return (
    <>
      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showPriceModal && (
        <PriceModal
          title="Edit Selling Price" label="Selling Price (SAR)"
          value={editedPrice} onChange={setEditedPrice}
          onSave={updateCarPrice} onClose={() => setShowPriceModal(false)}
          saving={updatingPrice} coverImage={coverImage} car={carDetails}
        />
      )}
      {showSellerAskingPriceModal && (
        <PriceModal
          title="Edit Seller Asking Price" label="Seller Asking Price (SAR)"
          value={editedSellerAskingPrice} onChange={setEditedSellerAskingPrice}
          onSave={updateSellerAskingPrice} onClose={() => setShowSellerAskingPriceModal(false)}
          saving={updatingSellerAskingPrice} coverImage={coverImage} car={carDetails}
        />
      )}
      {showRetailValueModal && (
        <PriceModal
          title="Edit Internal Value" label="Internal Value (SAR)"
          value={editedRetailValue} onChange={setEditedRetailValue}
          onSave={updateRetailValue} onClose={() => setShowRetailValueModal(false)}
          saving={updatingRetailValue} coverImage={coverImage} car={carDetails}
        />
      )}
      {showRevealPriceModal && (
        <PriceModal
          title="Reveal Price" label="Selling Price (SAR)"
          value={revealPrice ?? carDetails?.sellingPrice} onChange={setRevealPrice}
          onSave={() => {
            if (confirm('Are you sure you want to reveal the price')) {
              setShowRevealPriceModal(false);
              toast.success('Price revealed successfully');
            }
          }}
          onClose={() => setShowRevealPriceModal(false)}
          saving={false} coverImage={coverImage} car={carDetails}
        />
      )}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Push to Auction</h3>
              <button onClick={() => setShowAuctionModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {coverImage ? (
                  <img src={coverImage} alt="car" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Car size={24} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{carDetails?.make} {carDetails?.model}</p>
                  <p className="text-sm text-gray-500">{carDetails?.modelYear}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Minimum Start Price (Selling Price)</p>
                <p className="text-lg font-bold text-blue-700">SAR {fmt(Number(carDetails?.sellingPrice) || 0)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Auction Start Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">SAR</span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    value={auctionStartPrice || ''}
                    onChange={e => setAuctionStartPrice(Number(e.target.value))}
                    min={Number(carDetails?.sellingPrice) || 0}
                  />
                </div>
                {auctionStartPrice && auctionStartPrice < (Number(carDetails?.sellingPrice) || 0) && (
                  <p className="text-xs text-red-500 mt-1">Start price cannot be below selling price</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setShowAuctionModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  onClick={submitAuction}
                  disabled={pushingToAuction || !auctionStartPrice || auctionStartPrice < (Number(carDetails?.sellingPrice) || 0)}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {pushingToAuction ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Pushing…</> : 'Push to Auction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Hero Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#003B7E] to-[#0055b3] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <img src={coverImage} alt="car" className="w-20 h-16 object-cover rounded-xl border-2 border-white/20 shadow-md" />
                ) : (
                  <div className="w-20 h-16 bg-white/10 rounded-xl flex items-center justify-center border-2 border-white/20">
                    <Car size={28} className="text-white/60" />
                  </div>
                )}
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Car Details</p>
                  <h1 className="text-white text-2xl font-bold">
                    {carDetails?.make} {carDetails?.model} {carDetails?.modelYear}
                  </h1>
                  <p className="text-blue-200 text-xs mt-1">ID: {params?.id}</p>
                </div>
              </div>
              <StatusPill status={carDetails?.carStatus ?? 'unknown'} />
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { label: 'Mileage',       value:  carDetails?.exactMileage ? `${Number(carDetails.exactMileage).toLocaleString()} km` : carDetails?.mileage ? `${Number(carDetails.mileage).toLocaleString()} km` : '—' },
              { label: 'Engine',        value: carDetails?.engine || carDetails?.engineType || '—' },
              { label: 'Gear',          value: carDetails?.gearType || '—' },
              { label: 'Inspector', value: carDetails?.Inspection?.[0]?.inspectorName || 'N/A'},
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Winner Banner ────────────────────────────────────────────────── */}
        {auctionId && carDetails?.carStatus?.toLowerCase().includes('auction') && (
          <div>
            {loadingWinner ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-[#003B7E] border-t-transparent rounded-full" />
                <p className="text-sm text-[#003B7E] font-medium">Loading auction results…</p>
              </div>
            ) : winner ? (
              <div className="bg-blue-50 border-l-4 border-[#003B7E] rounded-2xl p-4 flex items-start gap-4">
                <div className="p-2 bg-[#003B7E] rounded-xl">
                  <Trophy size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#003B7E] uppercase tracking-wide mb-2">Current High Bidder</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Bidder</p>
                      <p className="text-sm font-semibold text-gray-800">{winner?.user?.firstName} {winner?.user?.lastName || ''}</p>
                      {winner?.user?.email && <p className="text-xs text-gray-500">{winner.user.email}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Winning Bid</p>
                      <p className="text-sm font-bold text-[#003B7E]">SAR {fmt(winner?.winningAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Winner</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={18} className="text-yellow-500" />
                <p className="text-sm text-yellow-700">Auction in progress — no winner determined yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Action Bar ────────────────────────────────────────────────────── */}
        {user?.role !== 'inspector' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Push-phase actions */}
            {canPush && (
              <>
                <button
                  onClick={() => {
                    if (!carDetails?.sellingPrice) { toast.error('Selling price must be set before pushing to listing'); return; }
                    if (confirm('Push this car to listing?')) markCarAsListed(carDetails.id);
                  }}
                  disabled={!carDetails?.sellingPrice}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ArrowUp size={15} /> Push to Listing
                </button>

                {user?.role !== 'sale' && carDetails?.carStatus !== 'push_to_inventory' && (
                  <button
                    onClick={() => { if (confirm('Push this car to inventory?')) markCarAsInventory(carDetails.id); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                  >
                    <Package size={15} /> Push to Inventory
                  </button>
                )}

                <button
                  onClick={() => {
                    if (!carDetails?.sellingPrice) { toast.error('Selling price must be set before pushing to auction'); return; }
                    openAuctionModal();
                  }}
                  disabled={!carDetails?.sellingPrice}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-400 text-amber-900 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Clock10 size={15} /> Push to Auction
                </button>
              </>
            )}

            {/* Post-list actions */}
            {canUnlist && (
              <>
                <button
                  onClick={() => {
                    if (confirm('Unlist this car?')) {
                      if (carDetails.carStatus === 'push_to_auction') removeCarStatusFromAuction(searchParams.get('auctionId') || '');
                      else markCarStatus(carDetails.id, 'unlisted');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                >
                  <Ban size={15} /> Unlist
                </button>
                <button
                  onClick={() => { if (confirm('Mark as reserved?')) markCarStatus(carDetails.id, 'hold'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  <Bookmark size={15} /> Mark Reserved
                </button>
                <button
                  onClick={() => { if (confirm('Push to inventory?')) markCarAsInventory(carDetails.id); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Package size={15} /> Push to Inventory
                </button>
                <button
                  onClick={() => { if (confirm('Mark as sold?')) markCarStatus(carDetails.id, 'sold'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <Check size={15} /> Mark Sold
                </button>
                <button
                  onClick={() => { if (confirm('Mark as returned?')) markCarStatus(carDetails.id, 'returned'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-700 text-white hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <RotateCcw size={15} /> Mark Returned
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Tabs */}
          <div className="xl:col-span-2 space-y-5">
            {/* Tab nav */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex border-b border-gray-100 px-2">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#003B7E] text-[#003B7E]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Details Tab ── */}
              {activeTab === 'details' && carDetails && (
                <div className="p-5 space-y-5">
                  {/* Specs grid */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Specifications</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {specs.map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                          <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                        </div>
                      ))}
                      {/* Status */}
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                        <StatusPill status={carDetails.carStatus} />
                      </div>
                    </div>
                  </div>

                  {/* Prices */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pricing</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Book Value</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {carDetails.bookValue ? `SAR ${Number(carDetails.bookValue).toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-blue-400 uppercase tracking-wide">Selling Price</p>
                          {isAdmin && (
                            <button
                              onClick={() => { setEditedPrice(Number(carDetails.sellingPrice) || 0); setShowPriceModal(true); }}
                              className="p-1 rounded-lg bg-[#003B7E]/10 hover:bg-[#003B7E]/20 text-[#003B7E] transition-colors"
                            >
                              <Pencil size={11} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#003B7E]">
                          {carDetails.sellingPrice ? `SAR ${Number(carDetails.sellingPrice).toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Seller Asking Price</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {carDetails.sellerAskingPrice ? `SAR ${Number(carDetails.sellerAskingPrice).toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-emerald-500 uppercase tracking-wide">Internal Value</p>
                          {isAdmin && (
                            <button
                              onClick={() => { setEditedRetailValue(Number(carDetails.retailValue) || 0); setShowRetailValueModal(true); }}
                              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors"
                            >
                              <Pencil size={11} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm font-bold text-emerald-700">
                          {carDetails.retailValue ? `SAR ${Number(carDetails.retailValue).toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {carDetails.notes && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{carDetails.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Inspection Tab ── */}
              {activeTab === 'inspection' && (
                <div className="p-5">
                  {!carDetails?.inspectionId ? (
                    <div className="text-center py-12">
                      <Car size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-400 text-sm">No inspection report available for this car.</p>
                    </div>
                  ) : !inspectionSchema ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003B7E]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Inspection Fields</p>
                        {inspectionDetails ? (
                          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                            {Object.keys(inspectionDetails.inspectionJson)
                              .filter(k => k !== 'overview')
                              .map(k => (
                                <div key={k} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50">
                                  <span className="text-sm text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                                  <span className="text-sm font-medium text-gray-800">
                                    {typeof inspectionDetails.inspectionJson[k] === 'object' && inspectionDetails.inspectionJson[k]?.length
                                      ? inspectionDetails.inspectionJson[k][0].value
                                      : typeof inspectionDetails.inspectionJson[k] === 'object' && !inspectionDetails.inspectionJson[k]?.length
                                        ? inspectionDetails.inspectionJson[k]?.value
                                        : inspectionDetails.inspectionJson[k] === '' ? 'N/A'
                                        : inspectionDetails.inspectionJson[k]}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-400 py-8 text-sm">Loading inspection preview…</p>
                        )}
                      </div>

                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Photos</p>
                          <div className="grid grid-cols-3 gap-2">
                            {images?.map((img: any, i: number) => (
                              <div key={i} className="rounded-lg overflow-hidden aspect-square bg-gray-100">
                                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                        {inspectionDetails?.carBodyConditionJson && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Car Body Condition</p>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <CarBodySvgView data={inspectionDetails.carBodyConditionJson} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Bids Tab ── */}
              {activeTab === 'bids' && (
                <div className="p-5 space-y-5">
                  {/* Internal bid form (sales role) */}
                  {user?.role === 'sale' && carDetails?.carStatus === 'push_to_auction' && carDetails?.bookValue && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-semibold text-[#003B7E] mb-3">Place Internal Bid</p>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Bid Amount (SAR)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">SAR</span>
                            <input
                              id="bidAmount"
                              type="number"
                              defaultValue={carDetails.bookValue}
                              step={1000}
                              onChange={e => setBidAmount(Number(e.target.value))}
                              className="w-full pl-12 pr-4 py-2.5 border border-blue-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003B7E]"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Book value: SAR {Number(carDetails.bookValue).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={placeInternalBid}
                          disabled={placingBid || !bidAmount}
                          className="px-5 py-2.5 bg-[#003B7E] text-white text-sm font-medium rounded-xl hover:bg-[#002d61] disabled:opacity-50 transition-colors"
                        >
                          {placingBid ? 'Placing…' : 'Place Bid'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bid progress */}
                  {bids?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                        <span>Start: SAR {carDetails?.sellingPrice ? Number(carDetails.sellingPrice).toLocaleString() : '0'}</span>
                        <span>Highest: SAR {fmt(highestBid)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
                        <div
                          className="h-full bg-[#003B7E] rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((highestBid - carDetails?.bookValue) / (carDetails?.bookValue || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bids table */}
                  {bids?.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                          <tr className="bg-[#003B7E]">
                            {['Bidder', 'Amount', 'Date', 'Status', 'Type'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {bids.map((bid: any, i: number) => (
                            <tr key={bid.id || i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-800">
                                  {bid?.userJson ? `${bid.userJson.firstName} ${bid.userJson.lastName || ''}` : 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-400">{bid.userJson?.email || ''}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-800">SAR {Number(bid.amount).toLocaleString()}</p>
                                {bid.previousAmount && <p className="text-xs text-gray-400">Prev: SAR {Number(bid.previousAmount).toLocaleString()}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-700">{new Date(bid.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-400">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  bid.userJson?.id === winner?.winnerUserId ? 'bg-green-100 text-green-700'
                                  : bid.status === 'accepted' ? 'bg-green-100 text-green-700'
                                  : bid.status === 'rejected' ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {bid.userJson?.id === winner?.winnerUserId ? 'Winner' : bid.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  bid.userJson?.type === 'Dealer' ? 'bg-blue-100 text-blue-700'
                                  : bid.userJson?.type === 'Sales Agent' ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {bid.userJson?.type || 'Standard'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign size={36} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-500">No bids yet</p>
                      <p className="text-xs text-gray-400 mt-1">No bids have been placed on this car.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Images Tab ── */}
              {activeTab === 'images' && (
                <div className="p-5">
                  {images?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((img: any, i: number) => (
                        <div 
                          key={i} 
                          className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer"
                          onClick={() => { setViewerIndex(i); setViewerOpen(true); }}
                        >
                          <img
                            src={img.url || img.path}
                            alt={img.caption || `Image ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {img.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car size={36} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-500">No images available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-4">
            {isAdmin && (
              <button
                onClick={() => setShowRevealPriceModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003B7E] text-white text-sm font-semibold hover:bg-[#002d61] transition-colors shadow-sm"
              >
                <Eye size={16} /> Reveal Price
              </button>
            )}
            <AuctionHistory auctions={auctionHistory} />
            <RevealPriceHistory history={[]} />
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {viewerOpen && images?.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setViewerOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setViewerOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 rounded-full text-white text-sm font-medium">
            {viewerIndex + 1} / {images.length}
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewerIndex(i => i === 0 ? images.length - 1 : i - 1); }}
              className="absolute left-4 p-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}

          {/* Main image */}
          <div 
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[viewerIndex]?.url || images[viewerIndex]?.path}
              alt={images[viewerIndex]?.caption || `Image ${viewerIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {images[viewerIndex]?.caption && (
              <div className="mt-3 px-4 py-2 bg-black/50 rounded-lg text-white text-sm">
                {images[viewerIndex].caption}
              </div>
            )}
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewerIndex(i => i === images.length - 1 ? 0 : i + 1); }}
              className="absolute right-4 p-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default CarsDetails;
