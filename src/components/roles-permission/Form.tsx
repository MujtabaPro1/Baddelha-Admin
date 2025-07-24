import { Save, Clock, Info, Shield } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRolePermission, updateRolePermission } from "../../service/role-permission";


interface RolesPermissionFormProps {
  initialData: any;
}

const RolesPermissionForm = ({ initialData }: RolesPermissionFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<any>(initialData);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes in seconds
  const [activePermission, setActivePermission] = useState<string | null>(null);

  const navigate = useNavigate();

  // Timer effect for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (
    key: string,
    value: boolean,
    permissionIndex: number
  ) => {
    setRole((oldRole: any) => {
      const newRole = {...oldRole};
      newRole["permissions"][permissionIndex][key] = value;
      return newRole;
    });
    
    // Highlight the changed permission briefly
    setActivePermission(`${permissionIndex}-${key}`);
    setTimeout(() => setActivePermission(null), 500);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      let response;
      if (role.id) {
        //Update
        response = await updateRolePermission(role?.id, role);
        console.log("update role", role);
        toast.success("Role updated successfully", {
          autoClose: 2000,
        });
      } else {
        //Create
        response = await createRolePermission(role);
        toast.success("Role created successfully", {
          autoClose: 2000,
        });
      }
      
      // Navigate after success

      setTimeout(() => {
        navigate('/roles-permission');
      }, 2000);
      
    } catch (ex: any) {
      toast.error("An error occurred while saving the role");
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate progress percentage for each permission type
  const calculateProgress = (type: string): number => {
    if (!role.permissions || role.permissions.length === 0) return 0;
    
    const total = role.permissions.length;
    const enabled = role.permissions.filter((p: any) => p[type]).length;
    
    return Math.round((enabled / total) * 100);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
        {/* Timer Section */}
        <div className="bg-blue-900 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-bold">Role Configuration</h2>
          </div>
          <div className="flex items-center space-x-2 bg-blue-800 px-4 py-2 rounded-full">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        {/* Progress Indicators */}
        <div className="p-6 bg-white border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Permission Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['create', 'read', 'update', 'delete'].map((type) => {
              const progress = calculateProgress(type);
              return (
                <div key={type} className="flex flex-col bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-900 capitalize">{type} Permissions</span>
                    <span className="text-sm font-bold text-blue-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3 mb-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 ease-in-out shadow-inner" 
                      style={{
                        width: `${progress}%`,
                        backgroundColor: '#1e3a8a', // blue-900
                        boxShadow: progress > 0 ? '0 0 8px rgba(30, 58, 138, 0.5)' : 'none'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-700 text-center">
                    {progress === 0 ? 'No permissions granted' : 
                     progress === 100 ? 'All permissions granted' : 
                     `${Math.round((progress / 100) * role.permissions.length)} of ${role.permissions.length} modules`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              id="name"
              required
              name="name"
              type="text"
              placeholder="Enter Role Name"
              defaultValue={role?.name || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-200"
              onChange={(value) => {
                setRole({ ...role, name: value.target.value });
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              id="description"
              required
              name="description"
              type="text"
              placeholder="Enter Description"
              defaultValue={role?.description || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all duration-200"
              onChange={(value) => {
                setRole({ ...role, description: value.target.value });
              }}
            />
          </div>
        </div>
        
        {/* Save Button - Floating */}
        <div className="fixed bottom-8 right-8 z-10">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 rounded-full bg-blue-900 px-6 py-3 font-medium text-white hover:bg-blue-800 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Role</span>
              </>
            )}
          </button>
        </div>

        {/* Modules & Permissions */}
        <div className="p-6 pt-0">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-blue-900 px-6 py-4 border-b border-blue-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-white" />
                  <h3 className="font-semibold text-white text-lg">
                    Modules & Permissions
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-6 text-sm font-medium text-white">
                  <div className="flex items-center justify-center">Create</div>
                  <div className="flex items-center justify-center">Read</div>
                  <div className="flex items-center justify-center">Update</div>
                  <div className="flex items-center justify-center">Delete</div>
                </div>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {role.permissions.map((mod: any, i: number) => {
                return (
                  <div
                    key={i}
                    className={`px-6 py-5 transition-all duration-200 ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 border-b border-gray-100`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                      <div className="font-medium text-gray-800 text-lg">{mod.appModule.name}</div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {['create', 'read', 'update', 'delete'].map((permission) => {
                          const isActive = role.permissions[i][permission];
                          return (
                            <div key={permission} className="flex items-center space-x-2">
                              <label 
                                className={`relative inline-flex items-center cursor-pointer ${activePermission === `${i}-${permission}` ? 'scale-110' : ''}`}
                              >
                                <input
                                  id={`permission[${mod.appModule.name}][${permission}]`}
                                  name={`permission[${mod.appModule.name}][${permission}]`}
                                  checked={isActive}
                                  type="checkbox"
                                  className="sr-only peer"
                                  onChange={(e) => {
                                    handleChange(permission, e.target.checked, i);
                                  }}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                              </label>
                              <span className={`text-sm font-medium capitalize ${isActive ? 'text-blue-900' : 'text-gray-500'}`}>
                                {permission}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Empty state if no permissions */}
            {role.permissions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-3 text-blue-200" />
                <p>No modules or permissions found</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default RolesPermissionForm;
