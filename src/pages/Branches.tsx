import React, { useState, useEffect } from 'react';
import { Building, Edit, Plus, Trash2, Users, UserPlus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';

// Define Branch interface
interface Branch {
  id: string;
  enName: string;
  arName?: string;
  address?: string;
  city?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Define User interface for supervisors and inspectors
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState<boolean>(false);
  const [showInspectorModal, setShowInspectorModal] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    enName: '',
    arName: '',
    address: '',
    city: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/1.0/branch');
      response?.data?.map((d: any)=>{
        d['status'] = 'active';
        d['city'] = d?.enName?.split(' ')[0] || ''
        return d;
      })
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/1.0/branch', formData);
      toast.success('Branch added successfully');
      setShowAddModal(false);
      setFormData({
        enName: '',
        arName: '',
        address: '',
        city: '',
        status: 'active'
      });
      fetchBranches();
    } catch (error) {
      console.error('Error adding branch:', error);
      toast.error('Failed to add branch');
    }
  };

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    
    try {
      await axiosInstance.put(`/1.0/branch/${selectedBranch.id}`, formData);
      toast.success('Branch updated successfully');
      setShowEditModal(false);
      fetchBranches();
    } catch (error) {
      console.error('Error updating branch:', error);
      toast.error('Failed to update branch');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await axiosInstance.delete(`/1.0/branch/${id}`);
        toast.success('Branch deleted successfully');
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error('Failed to delete branch');
      }
    }
  };

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      enName: branch.enName || '',
      arName: branch.arName || '',
      address: branch.address || '',
      city: branch.city || '',
      status: branch.status || 'active'
    });
    setShowEditModal(true);
  };

  const openSupervisorModal = async (branch: Branch) => {
    setSelectedBranch(branch);
    try {
      // Fetch supervisors
      const response = await axiosInstance.get('/1.0/users?role=supervisor');
      setSupervisors(response.data || []);
      setShowSupervisorModal(true);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast.error('Failed to load supervisors');
    }
  };

  const openInspectorModal = async (branch: Branch) => {
    setSelectedBranch(branch);
    try {
      // Fetch inspectors
      const response = await axiosInstance.get('/1.0/users?role=inspector');
      setInspectors(response.data || []);
      setShowInspectorModal(true);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      toast.error('Failed to load inspectors');
    }
  };

  const assignSupervisor = async (userId: string) => {
    if (!selectedBranch) return;
    
    try {
      await axiosInstance.post(`/1.0/branch/${selectedBranch.id}/supervisor`, { userId });
      toast.success('Supervisor assigned successfully');
      setShowSupervisorModal(false);
    } catch (error) {
      console.error('Error assigning supervisor:', error);
      toast.error('Failed to assign supervisor');
    }
  };

  const assignInspector = async (userId: string) => {
    if (!selectedBranch) return;
    
    try {
      await axiosInstance.post(`/1.0/branch/${selectedBranch.id}/inspector`, { userId });
      toast.success('Inspector assigned successfully');
      setShowInspectorModal(false);
    } catch (error) {
      console.error('Error assigning inspector:', error);
      toast.error('Failed to assign inspector');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Branch Management" 
        description="Manage all branches and assign supervisors and inspectors"
        actions={
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Branch
          </button>
        }
      />

      {/* Branches list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Branches</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={fetchBranches}
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
        ) : branches.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No branches found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-900">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{branch.enName}</div>
                          {branch.arName && <div className="text-sm text-gray-500">{branch.arName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{branch.city || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={branch.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                          onClick={() => openEditModal(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                          onClick={() => openSupervisorModal(branch)}
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-100"
                          onClick={() => openInspectorModal(branch)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                          onClick={() => handleDeleteBranch(branch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Add New Branch</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddBranch}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Name (English)</label>
                  <input
                    type="text"
                    name="enName"
                    value={formData.enName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Name (Arabic)</label>
                  <input
                    type="text"
                    name="arName"
                    value={formData.arName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
                <button
                  type="button"
                  className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Branch</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleEditBranch}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Name (English)</label>
                  <input
                    type="text"
                    name="enName"
                    value={formData.enName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Name (Arabic)</label>
                  <input
                    type="text"
                    name="arName"
                    value={formData.arName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
                <button
                  type="button"
                  className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {showSupervisorModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Supervisor to {selectedBranch.enName}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowSupervisorModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-4">
              {supervisors.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No supervisors available</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {supervisors.map((supervisor) => (
                    <div 
                      key={supervisor.id} 
                      className="p-3 border-b hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{supervisor.name}</p>
                        <p className="text-sm text-gray-500">{supervisor.email}</p>
                      </div>
                      <button
                        className="bg-blue-900 text-white px-3 py-1 rounded-md hover:bg-blue-800 text-sm"
                        onClick={() => assignSupervisor(supervisor.id)}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
              <button
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowSupervisorModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Inspector Modal */}
      {showInspectorModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Inspector to {selectedBranch.enName}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowInspectorModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-4">
              {inspectors.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No inspectors available</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {inspectors.map((inspector) => (
                    <div 
                      key={inspector.id} 
                      className="p-3 border-b hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{inspector.name}</p>
                        <p className="text-sm text-gray-500">{inspector.email}</p>
                      </div>
                      <button
                        className="bg-blue-900 text-white px-3 py-1 rounded-md hover:bg-blue-800 text-sm"
                        onClick={() => assignInspector(inspector.id)}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
              <button
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowInspectorModal(false)}
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

export default Branches;
