import React, { useEffect, useState, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, RefreshCw, Edit2, ChevronDown, X, Users, ClipboardCheck } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface Inspector {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  Inspector?: Array<{ branch_id: number; Branch?: { enName: string } }>;
}

interface Branch {
  id: string;
  enName: string;
  arName?: string;
  is_active: boolean;
}

const Inspectors = () => {
  const { user } = useAuth();
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspectors' | 'inspections'>('inspectors');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInspectors();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeTab === 'inspections') {
      fetchInspections();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInspectors = () => {
    setLoading(true);
    axiosInstance.get('/1.0/inspector/find-all').then((res) => {
      const inspectorUsers = res.data.data || [];
      setInspectors(inspectorUsers);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get('/1.0/branch');
      let branches = res.data || [];
      branches = branches.filter((branch: any) => branch.is_active);
      setBranches(branches);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInspections = async () => {
    setInspectionsLoading(true);
    try {
      const res = await axiosInstance.get('/1.0/inspection/find-all');
      setInspections(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInspectionsLoading(false);
    }
  };

  const handleUpdateBranch = async () => {
    if (!selectedInspector || !selectedBranchId) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/1.0/inspector/update/${selectedInspector.id}`, { branchId: Number(selectedBranchId) });
      toast.success('Branch updated successfully');
      setShowBranchModal(false);
      fetchInspectors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update branch');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedInspector || !selectedStatus) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/1.0/inspector/update/${selectedInspector.id}`, { status: selectedStatus });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      fetchInspectors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const openBranchModal = (inspector: Inspector) => {
    setSelectedInspector(inspector);
    const currentBranchId = inspector.Inspector?.[0]?.branch_id?.toString() || '';
    setSelectedBranchId(currentBranchId);
    setOpenDropdownId(null);
    setTimeout(() => setShowBranchModal(true), 0);
  };

  const openStatusModal = (inspector: Inspector) => {
    setSelectedInspector(inspector);
    setSelectedStatus(inspector.status || 'Active');
    setOpenDropdownId(null);
    setTimeout(() => setShowStatusModal(true), 0);
  };

  const filteredInspections = inspections.filter((insp: any) => {
    if (!mobileSearch.trim()) return true;
    const phone =
      insp?.BookAppointments?.[0]?.phone ||
      insp?.BookAppointment?.phone ||
      insp?.phone ||
      '';
    return phone.includes(mobileSearch.trim());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInspectorBranch = (inspector: Inspector) => {
    return inspector.Inspector?.[0]?.Branch?.enName || 'Not assigned';
  };

  return (
    <div>
      <PageHeader
        title="Inspectors"
        description="Manage all inspectors on the Baddelha platform"
      />

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inspectors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'inspectors'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} />
              Inspectors ({inspectors.length})
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'inspections'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardCheck size={16} />
              Inspections
            </button>
          </nav>
        </div>
      </div>

      {/* Inspectors Tab */}
      {activeTab === 'inspectors' && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search inspectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInspectors()}
                className="form-input pl-10"
              />
            </div>
            <button
              onClick={fetchInspectors}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="table-container" ref={dropdownRef}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Status</th>
                  {user?.role?.toLowerCase() === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {inspectors.map((inspector) => (
                  <tr key={inspector.id} className="hover:bg-gray-50 animated-transition">
                    <td className="font-medium text-gray-900">
                      {inspector.firstName} {inspector.lastName || ''}
                    </td>
                    <td>{inspector.email}</td>
                    <td>{inspector.phone}</td>
                    <td className="text-gray-600">{getInspectorBranch(inspector)}</td>
                    <td>
                      <StatusBadge status={inspector?.status as StatusType || 'active'} />
                    </td>
                    <td>
                      {user?.role?.toLowerCase() === 'admin' && (
                        <button
                          onClick={(e) => {
                            if (openDropdownId === inspector.id) {
                              setOpenDropdownId(null);
                              setDropdownPos(null);
                            } else {
                              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                              setDropdownPos({ top: rect.bottom + 4, left: rect.right - 176 });
                              setOpenDropdownId(inspector.id);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                          <Edit2 size={13} />
                          Edit
                          <ChevronDown size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
              </div>
            )}
            {!loading && inspectors.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No inspectors found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by mobile number..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <button
              onClick={fetchInspections}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-600 ${inspectionsLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Car</th>
                  <th>Mobile</th>
                  <th>Inspector</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map((insp: any) => (
                  <tr key={insp.id} className="hover:bg-gray-50 animated-transition">
                    <td>
                      <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                        #{insp.id}
                      </span>
                    </td>
                    <td className="font-medium text-gray-900">
                      {insp.Car?.year} {insp.Car?.make} {insp.Car?.model}
                    </td>
                    <td>{insp.BookAppointments?.[0]?.phone || insp.BookAppointment?.phone || '-'}</td>
                    <td>
                      {insp.Inspector?.User
                        ? `${insp.Inspector.User.firstName} ${insp.Inspector.User.lastName || ''}`
                        : '-'}
                    </td>
                    <td>{insp.Branch?.enName || '-'}</td>
                    <td>
                      <StatusBadge status={insp.inspectionStatus || insp.status} />
                    </td>
                    <td>{insp.createdAt ? formatDate(insp.createdAt) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {inspectionsLoading && (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
              </div>
            )}
            {!inspectionsLoading && filteredInspections.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">
                  {mobileSearch ? 'No inspections found for this mobile number.' : 'No inspections found.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Fixed-position dropdown — renders outside overflow container */}
      {openDropdownId && dropdownPos && (() => {
        const inspector = inspectors.find((i) => i.id === openDropdownId);
        if (!inspector) return null;
        return (
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 50 }}
            className="w-44 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openBranchModal(inspector);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
            >
              Update Branch
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openStatusModal(inspector);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors border-t border-gray-100"
            >
              Update Status
            </button>
          </div>
        );
      })()}

      {/* Update Branch Modal */}
      {showBranchModal && selectedInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBranchModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Update Branch</h2>
              <button
                onClick={() => setShowBranchModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Assign{' '}
                <span className="font-medium">
                  {selectedInspector.firstName} {selectedInspector.lastName}
                </span>{' '}
                to a branch.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.enName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBranch}
                  disabled={saving || !selectedBranchId}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Update Branch'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Update Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Update status for{' '}
                <span className="font-medium">
                  {selectedInspector.firstName} {selectedInspector.lastName}
                </span>
                .
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Update Status'
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

export default Inspectors;
