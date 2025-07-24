import RolesPermissionForm from "../../../components/roles-permission/Form";
import axiosInstance from "../../../service/api";
import { useEffect, useState } from "react";


const CreateRolePage = () => {
  const [modules,setModules] = useState([]);


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
     
  } 
};


  return (
    <>
      <RolesPermissionForm
        initialData={{
          name: "",
          description: "",
          permissions: modules.map((item:any) => {
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
    </>
  );
};

export default CreateRolePage;
