import RolesPermissionForm from "../../../components/roles-permission/Form";
import CreateModuleModal from "../../../components/roles-permission/CreateModuleModal";
import axiosInstance from "../../../service/api";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";


const CreateRolePage = () => {
  const [modules, setModules] = useState([]);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);


  useEffect(() => {
    findAllModules();
  }, []);

  const findAllModules = async () => {
    try {
      const res = await axiosInstance.get(
        "/1.0/role-permission/modules/find-all"
      );

      setModules(res.data);
    } catch (ex: any) {
      console.error('Error fetching modules:', ex);
    } 
  };

  const handleModuleCreated = () => {
    findAllModules();
  };


  return (
    <>
      {/* Header with Create Module Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
          <p className="text-sm text-gray-600 mt-1">Define role permissions for app modules</p>
        </div>
        <button
          onClick={() => setShowCreateModuleModal(true)}
          className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create App Module
        </button>
      </div>

      <RolesPermissionForm
        initialData={{
          name: "",
          description: "",
          permissions: modules.map((item: any) => {
            return {
              appModule: {
                name: item.name,
                path: item.path,
              },
              roleId: 0,
              appModuleId: item.id,
              create: false,
              read: false,
              update: false,
              delete: false,
            };
          }),
        }}
      />
      {modules.length === 0 && (
        <div className="m-10 text-center">
          <span>No Modules</span>
        </div>
      )}

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

export default CreateRolePage;
