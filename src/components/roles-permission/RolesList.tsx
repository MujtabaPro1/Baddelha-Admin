import { useEffect, useState } from "react";
import axiosInstance from "../../service/api";
import { Link } from "lucide-react";

import { 
   PlusSquare,
   PenSquare
} from 'lucide-react';
import { Button } from "@mui/material";

const RolesList = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    findAllRoles();
  }, []);


  const findAllRoles = async () => {
  try {
    const res = await axiosInstance.get("/1.0/role-permission/find-all")
    setRoles(res.data);
    console.log(res?.data);
    setLoading(false);
  } catch (ex: any) {
    setLoading(false);
  }
};

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex  justify-between items-center">
            <h3 className="font-medium text-black">Roles</h3>

          </div>
        </div>

        {roles?.map((role: any) => {
          return (
            <div
              key={role.id}
              className="grid grid-cols-7 border-b border-stroke dark:border-strokedark"
            >
              <div className="flex items-center p-2.5 xl:p-5 col-span-1">
                <p className="hidden text-black  sm:block">
                  {role.id}
                </p>
              </div>

              <div className="flex items-center p-2.5 xl:p-5 col-span-2">
                <p className="hidden text-black sm:block">
                  {role.name}
                </p>
              </div>

              <div className="flex items-center p-2.5 xl:p-5 col-span-3">
                <p className="hidden text-black sm:block">
                  {role.parent}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 col-span-1">
               
                <a href={`/roles-permission/update/${role.id}`}>
                  <PenSquare />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RolesList;
