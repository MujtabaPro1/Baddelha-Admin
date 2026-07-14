import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, RefreshCw, Plus, X, ChevronDown, Edit2, Flag, Eye, Ban } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import {
  createPriceRevealAdmin,
  createPriceRevealQa,
  findAllPriceReveals,
  revisePriceReveal,
  markFinalOffer,
  discardOffer,
} from '../service/priceReveal';
import { PriceReveal, PRICE_REVEAL_STATUS } from '../types/priceReveal';

const itemsPerPage = 10;

const fmtPrice = (v: any) => (v || v === 0) ? `SAR ${Number(v).toLocaleString()}` : '-';
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const PriceRevealPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const canCreate = isAdmin || user?.role?.toLowerCase() === 'qa';

  const [allReveals, setAllReveals] = useState<PriceReveal[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'discarded' | 'accepted' | 'rejected' | 'pending'>('pending');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [carSearch, setCarSearch] = useState('');
  const [carResults, setCarResults] = useState<any[]>([]);
  const [carSearchLoading, setCarSearchLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [createPrice, setCreatePrice] = useState<number | ''>('');
  const [createNote, setCreateNote] = useState('');
  const [creating, setCreating] = useState(false);

  // Revise modal
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [revisingReveal, setRevisingReveal] = useState<PriceReveal | null>(null);
  const [revisePrice, setRevisePrice] = useState<number | ''>('');
  const [revising, setRevising] = useState(false);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailReveal, setDetailReveal] = useState<PriceReveal | null>(null);

  const [markingFinalId, setMarkingFinalId] = useState<string | null>(null);
  const [discardingId, setDiscardingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReveals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showCreateModal) return;
    if (!carSearch.trim()) { setCarResults([]); return; }
    setCarSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await axiosInstance.get('/1.0/car/find-all', {
          params: { search: carSearch },
        });
        setCarResults(resp.data?.data || []);
      } catch (err) {
        console.error('Error searching cars:', err);
      } finally {
        setCarSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [carSearch, showCreateModal]);

  const fetchReveals = async () => {
    setLoading(true);
    try {
      const res = await findAllPriceReveals({ page: 1, limit: 500 });
      setAllReveals(res?.data || []);
    } catch (err) {
      console.error('Error fetching price reveals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Discarded reveals live in their own tab; the Active tab always excludes them.
  const tabFiltered = useMemo(() => {
    return allReveals.filter((r) =>
      activeTab === 'discarded'
        ? r.status === PRICE_REVEAL_STATUS.Discarded
        : activeTab === 'accepted'
        ? r.status === PRICE_REVEAL_STATUS.Accepted
        : activeTab === 'rejected'
        ? r.status === PRICE_REVEAL_STATUS.RejectedBySeller
        : activeTab === 'pending'
        ? r.status === PRICE_REVEAL_STATUS.Pending
        : r.status !== PRICE_REVEAL_STATUS.Discarded
    );
  }, [allReveals, activeTab]);

  const filteredReveals = useMemo(() => {
    return statusFilter ? tabFiltered.filter((r) => r.status === statusFilter) : tabFiltered;
  }, [tabFiltered, statusFilter]);

  const totalCount = filteredReveals.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const reveals = filteredReveals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusOptions = Object.values(PRICE_REVEAL_STATUS).filter((s) =>
    activeTab === 'discarded' ? s === PRICE_REVEAL_STATUS.Discarded : s !== PRICE_REVEAL_STATUS.Discarded
  );

  const resetCreateForm = () => {
    setCarSearch('');
    setCarResults([]);
    setSelectedCar(null);
    setCreatePrice('');
    setCreateNote('');
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!selectedCar) {
      toast.error('Please select a car');
      return;
    }
    if (!createPrice || Number(createPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setCreating(true);
    try {
      if (isAdmin) {
        const carResp = await axiosInstance.get('/1.0/car/find/' + selectedCar.id);
        const inspection = carResp.data?.car?.Inspection?.[0];
        if (!inspection?.id || !inspection?.inspectorId) {
          toast.error('No completed inspection with an assigned inspector found for this car');
          setCreating(false);
          return;
        }
        await createPriceRevealAdmin({
          carId: selectedCar.id,
          inspectionId: inspection.id,
          inspectorUserId: inspection.inspectorId,
          price: Number(createPrice),
          note: createNote || undefined,
        });
      } else {
        await createPriceRevealQa({
          carId: selectedCar.id,
          price: Number(createPrice),
          note: createNote || undefined,
        });
      }
      toast.success('Price reveal created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      setCurrentPage(1);
      fetchReveals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create price reveal');
    } finally {
      setCreating(false);
    }
  };

  const openReviseModal = (reveal: PriceReveal) => {
    setRevisingReveal(reveal);
    setRevisePrice(reveal.price || '');
    setOpenDropdownId(null);
    setTimeout(() => setShowReviseModal(true), 0);
  };

  const handleRevise = async () => {
    if (!revisingReveal) return;
    if (!revisePrice || Number(revisePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setRevising(true);
    try {
      await revisePriceReveal(revisingReveal.id, { price: Number(revisePrice) });
      toast.success('Price revised successfully');
      setShowReviseModal(false);
      fetchReveals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revise price');
    } finally {
      setRevising(false);
    }
  };

  const handleMarkFinal = async (reveal: PriceReveal) => {
    if (!confirm('Mark this offer as final? If the seller rejects a final offer, the deal will be permanently closed.')) return;
    setMarkingFinalId(reveal.id);
    setOpenDropdownId(null);
    try {
      await markFinalOffer(reveal.id);
      toast.success('Offer marked as final');
      fetchReveals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark offer as final');
    } finally {
      setMarkingFinalId(null);
    }
  };

  const handleDiscard = async (reveal: PriceReveal) => {
    if (!confirm('Discard this offer? This action cannot be undone.')) return;
    setDiscardingId(String(reveal.id));
    setOpenDropdownId(null);
    try {
      await discardOffer(String(reveal.id));
      toast.success('Offer discarded');
      fetchReveals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to discard offer');
    } finally {
      setDiscardingId(null);
    }
  };

  const openDetailModal = (reveal: PriceReveal) => {
    setDetailReveal(reveal);
    setOpenDropdownId(null);
    setTimeout(() => setShowDetailModal(true), 0);
  };

  const carLabel = (car: any) => car ? `${car.modelYear || ''} ${car.make || ''} ${car.model || ''}`.trim() : '-';

  return (
    <div>
      <PageHeader
        title="Price Negotiation"
        description="Manage price offers between QA, inspectors, and sellers"
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="hidden relative flex-1 sm:max-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/([a-z])([A-Z])/g, '$1 $2')}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        {canCreate && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} />
            Create Price Reveal
          </button>
        )}
      </div>

      <div className='flex justify-between items-center mb-6'>
      <div className="inline-flex rounded-md border border-gray-200 bg-white p-1">
        <button
          onClick={() => { setActiveTab('active'); setStatusFilter(''); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setActiveTab('pending'); setStatusFilter(''); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'pending' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => { setActiveTab('discarded'); setStatusFilter(''); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'discarded' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Discarded
        </button>
          <button
          onClick={() => { setActiveTab('accepted'); setStatusFilter(''); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'accepted' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Accepted
        </button>
            <button
          onClick={() => { setActiveTab('rejected'); setStatusFilter(''); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'rejected' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Rejected
        </button>
      </div>
       <button
          onClick={() => fetchReveals()}
          className="p-2 ml-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="table-container" ref={dropdownRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Car</th>
              <th>Price</th>
              <th>Status</th>
              <th>Final Offer</th>
              <th>Customeer</th>
              <th>Inspector</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reveals.map((reveal) => {
              const car = reveal.Car || reveal.car;
              const canRevise = reveal.status === PRICE_REVEAL_STATUS.RejectedBySeller && !reveal.isFinalOffer;
              const canMarkFinal = (reveal.status === PRICE_REVEAL_STATUS.Pending || reveal.status === PRICE_REVEAL_STATUS.RejectedBySeller) && !reveal.isFinalOffer;
              return (
                <tr key={reveal.id} className="hover:bg-gray-50 animated-transition">
                  <td className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <img
                        src={reveal?.carFrontImage ? 'https://service.baddelha.com.sa' + '/api/1.0/media/' + reveal.carFrontImage : "https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"}
                        alt={carLabel(car)}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{carLabel(car)}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>ID: {car?.id?.slice(0, 8)}</span>
                          {car?.engine || car?.engineType ? <span>• {car.engine || car.engineType}</span> : null}
                          {car?.exactMileage || car?.mileage ? (
                            <span>• {car.exactMileage ? `${(car.exactMileage / 1000).toFixed(0)}K km` : `${(car.mileage / 1000).toFixed(0)}K km`}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{fmtPrice(reveal.price)}</td>
                  <td><StatusBadge status={reveal.status as any} /></td>
                  <td>
                    {reveal.isFinalOffer ? (
                      <span className="badge bg-purple-100 text-purple-800">Final</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td>{reveal.customerName || '—'}</td>
                  <td>{reveal.inspection?.Inspector?.user?.firstName || '—'}</td>
                  <td className="text-gray-600">{fmtDate(reveal.createdAt)}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        if (openDropdownId === reveal.id) {
                          setOpenDropdownId(null);
                          setDropdownPos(null);
                        } else {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setDropdownPos({ top: rect.bottom + 4, left: rect.right - 176 });
                          setOpenDropdownId(reveal.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Actions
                      <ChevronDown size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          </div>
        )}
        {!loading && reveals.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No price reveals found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Fixed-position actions dropdown */}
      {openDropdownId && dropdownPos && (() => {
        const reveal = reveals.find((r) => r.id === openDropdownId);
        if (!reveal) return null;
        const canRevise = reveal.status != PRICE_REVEAL_STATUS.Discarded && reveal.status != PRICE_REVEAL_STATUS.Accepted;
        const canMarkFinal = (reveal.status === PRICE_REVEAL_STATUS.Pending || reveal.status === PRICE_REVEAL_STATUS.RejectedBySeller) && !reveal.isFinalOffer;
        return (
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 50 }}
            className="w-44 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDetailModal(reveal); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye size={14} /> View Details
            </button>
            {canRevise && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openReviseModal(reveal); }}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <Edit2 size={14} /> Revise Price
              </button>
            )}
            {canMarkFinal && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkFinal(reveal); }}
                disabled={markingFinalId === reveal.id}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100 disabled:opacity-50"
              >
                <Flag size={14} /> Mark as Final
              </button>
            )}
            {reveal.status === PRICE_REVEAL_STATUS.RejectedBySeller && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDiscard(reveal); }}
                disabled={discardingId === String(reveal.id)}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 disabled:opacity-50"
              >
                <Ban size={14} /> Discard Offer
              </button>
            )}
          </div>
        );
      })()}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Create Price Reveal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car <span className="text-red-500">*</span>
                </label>
                {selectedCar ? (
                  <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-800">{carLabel(selectedCar)}</span>
                    <button
                      onClick={() => { setSelectedCar(null); setCarSearch(''); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search inspected cars by make, model..."
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {carSearch.trim() && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                        {carSearchLoading ? (
                          <div className="px-3 py-3 text-sm text-gray-500">Searching...</div>
                        ) : carResults.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-gray-500">No inspected cars found</div>
                        ) : (
                          carResults.map((car) => (
                            <button
                              key={car.id}
                              onClick={() => { setSelectedCar(car); setCarSearch(''); setCarResults([]); }}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                            >
                              <img
                                src={car.coverImage || "https://www.shutterstock.com/image-illustration/silver-silk-covered-car-concept-600w-1037886004.jpg"}
                                alt={carLabel(car)}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 truncate">{carLabel(car)}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>ID: {car.id?.slice(0, 8)}</span>
                                  {car.engine || car.engineType ? <span>• {car.engine || car.engineType}</span> : null}
                                  {car.exactMileage || car.mileage ? (
                                    <span>• {car.exactMileage ? `${(car.exactMileage / 1000).toFixed(0)}K km` : `${(car.mileage / 1000).toFixed(0)}K km`}</span>
                                  ) : null}
                                </div>
                              </div>
                              {car.sellingPrice || car.bookValue ? (
                                <span className="text-xs font-semibold text-blue-600 shrink-0">
                                  SAR {Number(car.sellingPrice || car.bookValue).toLocaleString()}
                                </span>
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">Only cars with status "Inspected" are shown.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (SAR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  rows={3}
                  value={createNote}
                  onChange={(e) => setCreateNote(e.target.value)}
                  placeholder="Internal note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revise Modal */}
      {showReviseModal && revisingReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReviseModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Revise Price</h2>
              <button
                onClick={() => setShowReviseModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                The seller rejected the previous offer of{' '}
                <span className="font-medium">{fmtPrice(revisingReveal.price)}</span>. Enter a new price.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Price (SAR)</label>
                <input
                  type="number"
                  value={revisePrice}
                  onChange={(e) => setRevisePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevise}
                  disabled={revising}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {revising ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Save New Price'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Price Reveal Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Car</span>
                <span className="font-medium text-gray-800">{carLabel(detailReveal.Car || detailReveal.car)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-medium text-gray-800">{fmtPrice(detailReveal.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={detailReveal.status as any} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Final Offer</span>
                <span className="font-medium text-gray-800">{detailReveal.isFinalOffer ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-800">{fmtDate(detailReveal.createdAt)}</span>
              </div>
              {detailReveal.note && (
                <div>
                  <span className="text-gray-500 block mb-1">Note</span>
                  <p className="text-gray-800 bg-gray-50 rounded-lg p-2">{detailReveal.note}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRevealPage;
