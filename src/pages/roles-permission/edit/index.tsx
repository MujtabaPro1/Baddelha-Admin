
import { useEffect, useState } from "react";
import axiosInstance from "../../../service/api";
import { useParams } from "react-router-dom";

 import RolesPermissionForm from "../../../components/roles-permission/Form";
import { useNavigate } from "react-router-dom";
 

const EditRolePage = () => {
  const [role,setRole]: any = useState({});
  const params = useParams();
  const navigate = useNavigate();
  const [modules,setModules] = useState([]);



  const findRolePermission = async (roleId: number) => {
    try {
      const res = await axiosInstance.get("/1.0/role-permission/find/" + roleId);
      setRole(res?.data);
    } catch (ex: any) {

    }
  };



  useEffect(() => {
    findAllModules();
    findRolePermission(params.id);
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


  if(!role){
    <div>
      <span>Role not found</span>
    </div>
  }

 
 
  return (
    <>
       {role && role?.Permission &&  <RolesPermissionForm
        initialData={{
          id:role?.id,
          name: role?.name,
          description: role?.description,
          permissions: modules.map((item : any,index:number) => {
            let defaultValue = {
              create: false,
              read: false,
              update: false,
              delete: false,
            };

            if (role.Permission[index]) {
              defaultValue = {
                create: role.Permission[index]["create"],
                read: role.Permission[index]["read"],
                update: role.Permission[index]["update"],
                delete: role.Permission[index]["delete"],
              };
            }

            return {
              appModule: {
                name: item.name,
                path: item.path,
              },
              roleId: role.id,
              appModuleId: item.id,
              create: defaultValue.create,
              read: defaultValue.read,
              update: defaultValue.update,
              delete: defaultValue.delete,
            };
          }),
        }}
      />}
      {!role && (
        <div className="m-10 text-center">
          <span>No Modules</span>
        </div>
      )} 
    </>
  );
};

export default EditRolePage;
