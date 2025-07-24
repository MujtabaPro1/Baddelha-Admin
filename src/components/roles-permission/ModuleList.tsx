'use client';

import { Link, PenSquare } from "lucide-react";
import axiosInstance from "../../service/api";

import { useEffect, useState } from "react";

const ModuleList = () => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    findAllModules();
  },[]);

  const findAllModules = async () => {
    try {
      const res = await axiosInstance.get(
        "/1.0/role-permission/modules/find-all"
      );
  
      setModules(res.data);
      setLoading(false);
    } catch (ex: any) {
       
    } 
  };
  

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black">
              All Modules
            </h3>
          </div>
        </div>
        {modules?.map((item: any) => {
          return (
            <div
              key={item.id}
              className="grid grid-cols-7 border-b border-stroke dark:border-strokedark"
            >
              <div className="col-span-1 p-2.5 xl:p-5">
                <p className=" text-black">{item.id}</p>
              </div>

              <div className="col-span-2 gap-3 p-2.5 xl:p-5">
                <p className=" text-black ">{item.name} </p>
              </div>

              <div className="col-span-2 gap-3 p-2.5 xl:p-5">
                <p className=" text-black ">{item.path}</p>
              </div>
              <div className="flex items-center col-span-2 justify-center">
                <a href={`/roles-permission/update/${item.id}`}>
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

export default ModuleList;
