import React, { useState, useEffect } from 'react';
import axiosInstance from '../service/api';

interface CarMake {
  id: number;
  name: string;
  nameAr?: string;
}

interface CarModel {
  id: number;
  carMakeId: number;
  name: string;
  nameAr?: string;
}

const MakeModel = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [isAddMakeOpen, setIsAddMakeOpen] = useState(false);
  const [isEditMakeOpen, setIsEditMakeOpen] = useState(false);
  const [makeSearch, setMakeSearch] = useState('');
  const [addMakeId, setAddMakeId] = useState<number | ''>('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelNameAr, setNewModelNameAr] = useState('');
  const [newMakeName, setNewMakeName] = useState('');
  const [newMakeNameAr, setNewMakeNameAr] = useState('');
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [editingMake, setEditingMake] = useState<CarMake | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<{ makes: boolean; models: boolean }>({
    makes: false,
    models: false,
  });
  const [error, setError] = useState<{ makes: string | null; models: string | null }>({
    makes: null,
    models: null,
  });

  const fetchMakes = async () => {
    setLoading(prev => ({ ...prev, makes: true }));
    setError(prev => ({ ...prev, makes: null }));

    try {
      const response = await axiosInstance.get('1.0/car-options/car-make');
      setMakes(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching car makes:', err);
      setError(prev => ({ ...prev, makes: 'Failed to fetch car makes. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  const handleDeleteModel = async (modelId: number) => {
    if (!selectedMake) return;

    const confirmed = window.confirm('Are you sure you want to delete this model?');
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`1.0/car-options/car-model/${modelId}`);
      await fetchModels(selectedMake.id);
    } catch (err) {
      console.error('Error deleting car model:', err);
      alert('Failed to delete model. Please try again.');
    }
  };

  const fetchModels = async (makeId: number) => {
    setLoading(prev => ({ ...prev, models: true }));
    setError(prev => ({ ...prev, models: null }));

    try {
      const response = await axiosInstance.get(`1.0/car-options/car-model/${makeId}`);
      setModels(response.data || []);
    } catch (err) {
      console.error('Error fetching car models:', err);
      setError(prev => ({ ...prev, models: 'Failed to fetch car models. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  // Fetch car makes on component mount
  useEffect(() => {
    fetchMakes();
  }, []);

  // Fetch car models when a make is selected
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }

    fetchModels(selectedMake.id);
  }, [selectedMake]);

  const handleMakeSelect = (make: CarMake) => {
    setSelectedMake(make);
  };

  const openAddModel = () => {
    setSubmitError(null);
    setNewModelName('');
    setNewModelNameAr('');
    setMakeSearch('');
    setAddMakeId(selectedMake?.id || '');
    setIsAddModelOpen(true);
  };

  const closeAddModel = () => {
    setIsAddModelOpen(false);
  };

  const openEditModel = (model: CarModel) => {
    setEditingModel(model);
    setNewModelName(model.name);
    setNewModelNameAr(model.nameAr || '');
    setSubmitError(null);
    setIsEditModelOpen(true);
  };

  const closeEditModel = () => {
    setIsEditModelOpen(false);
    setEditingModel(null);
  };

  const openAddMake = () => {
    setSubmitError(null);
    setNewMakeName('');
    setNewMakeNameAr('');
    setIsAddMakeOpen(true);
  };

  const closeAddMake = () => {
    setIsAddMakeOpen(false);
  };

  const openEditMake = (make: CarMake) => {
    setEditingMake(make);
    setNewMakeName(make.name);
    setNewMakeNameAr(make.nameAr || '');
    setSubmitError(null);
    setIsEditMakeOpen(true);
  };

  const closeEditMake = () => {
    setIsEditMakeOpen(false);
    setEditingMake(null);
  };

  const openBulkUpload = () => {
    setSubmitError(null);
    setBulkFile(null);
    setIsBulkUploadOpen(true);
  };

  const closeBulkUpload = () => {
    setIsBulkUploadOpen(false);
    setBulkFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  const submitBulkUpload = async () => {
    if (!bulkFile) {
      setSubmitError('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      await axiosInstance.post('1.0/car-options/make-model/bulk-update/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchMakes();
      if (selectedMake) {
        await fetchModels(selectedMake.id);
      }
      closeBulkUpload();
      alert('Bulk upload completed successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      setSubmitError('Failed to upload file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMakes = makes.filter((m) =>
    m.name.toLowerCase().includes(makeSearch.trim().toLowerCase())
  );

  const submitAddModel = async () => {
    if (!addMakeId || !newModelName.trim()) {
      setSubmitError('Please select a make and enter a model name');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axiosInstance.post(`1.0/car-options/car-model/${addMakeId}`, {
        carModelName: newModelName.trim(),
        carModelNameAr: newModelNameAr.trim() || undefined,
      });

      await fetchModels(addMakeId);
      const make = makes.find((m) => m.id === addMakeId) || null;
      if (make) setSelectedMake(make);

      closeAddModel();
    } catch (err) {
      console.error('Error creating car model:', err);
      setSubmitError('Failed to add model. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditModel = async () => {
    if (!editingModel || !newModelName.trim()) {
      setSubmitError('Please enter a model name');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axiosInstance.post(`1.0/car-options/car-model/${editingModel.carMakeId}`, {
        carModelName: newModelName.trim(),
        carModelNameAr: newModelNameAr.trim() || undefined,
      });

      await fetchModels(editingModel.carMakeId);
      closeEditModel();
    } catch (err) {
      console.error('Error updating car model:', err);
      setSubmitError('Failed to update model. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAddMake = async () => {
    if (!newMakeName.trim()) {
      setSubmitError('Please enter a make name');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axiosInstance.post('1.0/car-options/car-make', {
        carMakeName: newMakeName.trim(),
        carMakeNameAr: newMakeNameAr.trim() || undefined,
      });

      await fetchMakes();
      closeAddMake();
    } catch (err) {
      console.error('Error creating car make:', err);
      setSubmitError('Failed to add make. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditMake = async () => {
    if (!editingMake || !newMakeName.trim()) {
      setSubmitError('Please enter a make name');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axiosInstance.post('1.0/car-options/car-make', {
        carMakeName: newMakeName.trim(),
        carMakeNameAr: newMakeNameAr.trim() || undefined,
      });

      await fetchMakes();
      closeEditMake();
    } catch (err) {
      console.error('Error updating car make:', err);
      setSubmitError('Failed to update make. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Car Makes and Models</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openBulkUpload}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Bulk Upload Excel
            </button>
            <button
              type="button"
              onClick={openAddMake}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add New Make
            </button>
            <button
              type="button"
              onClick={openAddModel}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              Add New Model
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Car Makes Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Car Makes</h2>
            
            {loading.makes ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : error.makes ? (
              <div className="text-red-500">{error.makes}</div>
            ) : (
              <div className="space-y-2">
                {makes.map((make) => (
                  <div
                    key={make.id}
                    className={`p-3 border rounded-md transition-colors ${
                      selectedMake?.id === make.id
                        ? 'bg-blue-100 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 cursor-pointer" onClick={() => handleMakeSelect(make)}>
                        <div className="font-medium">{make.name}</div>
                        {make.nameAr && <div className="text-sm text-gray-600" dir="rtl">{make.nameAr}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMake(make);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 px-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Car Models Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMake ? `${selectedMake.name} Models` : 'Car Models'}
            </h2>
            
            {!selectedMake ? (
              <div className="text-gray-500 text-center py-8">
                Please select a car make to view available models
              </div>
            ) : loading.models ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : error.models ? (
              <div className="text-red-500">{error.models}</div>
            ) : models.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No models found for {selectedMake.name}
              </div>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{model.name}</div>
                        {model.nameAr && <div className="text-sm text-gray-600" dir="rtl">{model.nameAr}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModel(model)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModel(model.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddModelOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Model</h3>
              <button
                type="button"
                onClick={closeAddModel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input
                  value={makeSearch}
                  onChange={(e) => setMakeSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Search makes..."
                />
                <div className="mt-2 max-h-48 overflow-auto border border-gray-200 rounded-md">
                  {filteredMakes.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No makes found</div>
                  ) : (
                    filteredMakes.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAddMakeId(m.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          addMakeId === m.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        {m.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (English)</label>
                <input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter model name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (Arabic)</label>
                <input
                  value={newModelNameAr}
                  onChange={(e) => setNewModelNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم الموديل"
                  dir="rtl"
                />
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitAddModel}
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {isEditModelOpen && editingModel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Model</h3>
              <button
                type="button"
                onClick={closeEditModel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (English)</label>
                <input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter model name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (Arabic)</label>
                <input
                  value={newModelNameAr}
                  onChange={(e) => setNewModelNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم الموديل"
                  dir="rtl"
                />
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEditModel}
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Make Modal */}
      {isAddMakeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Make</h3>
              <button
                type="button"
                onClick={closeAddMake}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make Name (English)</label>
                <input
                  value={newMakeName}
                  onChange={(e) => setNewMakeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter make name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make Name (Arabic)</label>
                <input
                  value={newMakeNameAr}
                  onChange={(e) => setNewMakeNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم الصانع"
                  dir="rtl"
                />
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddMake}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitAddMake}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bulk Upload Excel</h3>
              <button
                type="button"
                onClick={closeBulkUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Excel File
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload an Excel file to create or update car makes and models in bulk
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {bulkFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {bulkFile.name}
                  </p>
                )}
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeBulkUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitBulkUpload}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Make Modal */}
      {isEditMakeOpen && editingMake && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Make</h3>
              <button
                type="button"
                onClick={closeEditMake}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make Name (English)</label>
                <input
                  value={newMakeName}
                  onChange={(e) => setNewMakeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter make name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make Name (Arabic)</label>
                <input
                  value={newMakeNameAr}
                  onChange={(e) => setNewMakeNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="أدخل اسم الصانع"
                  dir="rtl"
                />
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditMake}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEditMake}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakeModel;
