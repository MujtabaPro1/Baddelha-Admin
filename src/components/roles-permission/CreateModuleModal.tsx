import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createAppModule } from '../../service/role-permission';
import { toast } from 'react-toastify';

interface CreateModuleModalProps {
  onClose: () => void;
  onModuleCreated: () => void;
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ onClose, onModuleCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    path: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAppModule(formData);
      toast.success('App module created successfully');
      onModuleCreated();
      onClose();
    } catch (error) {
      console.error('Error creating app module:', error);
      toast.error('Failed to create app module');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New App Module</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Module Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dealer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              id="description"
              name="description"
              type="text"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Dealer module permissions"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            />
          </div>

          <div>
            <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
              Path *
            </label>
            <input
              id="path"
              name="path"
              type="text"
              required
              value={formData.path}
              onChange={handleChange}
              placeholder="e.g., /dashboard/dealer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            />
            <p className="mt-1 text-xs text-gray-500">Enter the route path for this module</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleModal;
