import RolesList from "../../components/roles-permission/RolesList";
import ModuleList from "../../components/roles-permission/ModuleList";
import CreateModuleModal from "../../components/roles-permission/CreateModuleModal";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Plus } from "lucide-react";

const RolesPermissionPage = () => {
  const { user } = useAuth();
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isSuperAdmin = user?.role === 'admin';

  const handleModuleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      {/* Header with Create Module Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage roles and app module permissions</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateModuleModal(true)}
            className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create App Module
          </button>
        )}
      </div>

      {/* Roles & Permission Listing */}
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-2">
          <RolesList />
        </div>

        <div className="col-span-5 xl:col-span-3">
          <ModuleList key={refreshKey} />
        </div>
      </div>

      {/* Create Module Modal */}
      {showCreateModuleModal && (
        <CreateModuleModal
          onClose={() => setShowCreateModuleModal(false)}
          onModuleCreated={handleModuleCreated}
        />
      )}
    </>
  );
};

export default RolesPermissionPage;
