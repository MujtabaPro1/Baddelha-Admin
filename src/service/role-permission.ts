import { RolePermissionDto } from "../types";
import { axiosErrorHandler } from "../types/utils";
import axiosInstance from "./api";


export const createRolePermission = async (body: RolePermissionDto) => {
  try {
    const res = await axiosInstance.post("/1.0/role-permission/create", body);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const findAllRoles = async () => {
  try {
    const res = await axiosInstance.get("/1.0/role-permission/find-all");
    
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};
export const findRolePermission = async (roleId: number) => {
  try {
    const res = await axiosInstance.get("/1.0/role-permission/find/" + roleId);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const findAllModules = async () => {
  try {
    const res = await axiosInstance.get(
      "/1.0/role-permission/modules/find-all"
    );

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const updateRolePermission = async (
  roleId: number,
  body: RolePermissionDto
) => {
  try {;
    const res = await axiosInstance.put(
      "/1.0/role-permission/update/" + roleId,
      body
    );

    return res.data;
  } catch (ex: any) {
    console.log("jalal",ex);
    return axiosErrorHandler(ex);
  }
};
