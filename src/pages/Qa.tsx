import React, { useEffect, useState, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, RefreshCw, Edit2, ChevronDown, X, Plus, ShieldCheck } from 'lucide-react';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface QaUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string | null;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
}

const itemsPerPage = 10;

const Qa = () => {
  const { user } = useAuth();
  const [qaUsers, setQaUsers] = useState<QaUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedQa, setSelectedQa] = useState<QaUser | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Pending' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);

  const initialCreateForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    status: 'Pending',
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [creating, setCreating] = useState(false);

  const initialEditForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQaUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQaUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/1.0/qa/find-all', {
        params: { page, limit: itemsPerPage, ...(searchQuery ? { search: searchQuery } : {}) },
      });
      setQaUsers(res.data?.data || []);
      const total = res.data?.totalCount || 0;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / itemsPerPage) || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQa = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phone || !createForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      await axiosInstance.post('/1.0/qa/create', {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        phone: createForm.phone,
        password: createForm.password,
        status: createForm.status,
      });
      toast.success('QA user created successfully');
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);
      fetchQaUsers(1);
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create QA user');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (qa: QaUser) => {
    setSelectedQa(qa);
    setEditForm({
      firstName: qa.firstName,
      lastName: qa.lastName,
      email: qa.email,
      phone: qa.phone,
      password: '',
    });
    setOpenDropdownId(null);
    setTimeout(() => setShowEditModal(true), 0);
  };

  const handleUpdateQa = async () => {
    if (!selectedQa) return;
    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setUpdating(true);
    try {
      const body: Record<string, string> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
      };
      if (editForm.password) body.password = editForm.password;

      await axiosInstance.put(`/1.0/qa/update/${selectedQa.id}`, body);
      toast.success('QA user updated successfully');
      setShowEditModal(false);
      fetchQaUsers(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update QA user');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (qa: QaUser) => {
    setSelectedQa(qa);
    setSelectedStatus(qa.status || 'Active');
    setOpenDropdownId(null);
    setTimeout(() => setShowStatusModal(true), 0);
  };

  const handleUpdateStatus = async () => {
    if (!selectedQa) return;
    setSaving(true);
    try {
      await axiosInstance.patch(`/1.0/qa/update-status/${selectedQa.id}`, { status: selectedStatus });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      fetchQaUsers(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <PageHeader title="QA" description="Manage all QA users on the Baddelha platform" />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search QA users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQaUsers(1)}
            className="form-input pl-10"
          />
        </div>
        <button
          onClick={() => fetchQaUsers(currentPage)}
          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {user?.role?.toLowerCase() === 'admin' && (
          <button
            onClick={() => { setCreateForm(initialCreateForm); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} />
            Add QA User
          </button>
        )}
      </div>

      <div className="table-container" ref={dropdownRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
              {user?.role?.toLowerCase() === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {qaUsers.map((qa) => (
              <tr key={qa.id} className="hover:bg-gray-50 animated-transition">
                <td className="font-medium text-gray-900">
                  {qa.firstName} {qa.lastName || ''}
                </td>
                <td>{qa.email}</td>
                <td>{qa.phone}</td>
                <td>
                  <StatusBadge status={(qa?.status?.toLowerCase() || 'active') as any} />
                </td>
                <td className="text-gray-600">{qa.createdAt ? formatDate(qa.createdAt) : '-'}</td>
                <td>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <button
                      onClick={(e) => {
                        if (openDropdownId === qa.id) {
                          setOpenDropdownId(null);
                          setDropdownPos(null);
                        } else {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setDropdownPos({ top: rect.bottom + 4, left: rect.right - 176 });
                          setOpenDropdownId(qa.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
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
        {!loading && qaUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No QA users found.</p>
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

      {/* Fixed-position dropdown — renders outside overflow container */}
      {openDropdownId && dropdownPos && (() => {
        const qa = qaUsers.find((q) => q.id === openDropdownId);
        if (!qa) return null;
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
                openEditModal(qa);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openStatusModal(qa);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors border-t border-gray-100"
            >
              Update Status
            </button>
          </div>
        );
      })()}

      {/* Edit QA Modal */}
      {showEditModal && selectedQa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Edit QA User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+9665xxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQa}
                  disabled={updating}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedQa && (
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
                  {selectedQa.firstName} {selectedQa.lastName}
                </span>
                .
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'Active' | 'Pending' | 'Inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
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
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
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

      {/* Create QA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Add QA User
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+9665xxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  onClick={handleCreateQa}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    'Create QA User'
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

export default Qa;
