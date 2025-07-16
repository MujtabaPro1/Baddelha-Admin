import { InspectionCreateDto, InspectionUpdateDto } from "../types/dto";
import { axiosErrorHandler } from "../types/utils";
import axiosInstance from "./api";

export const createInspection = async (body: InspectionCreateDto) => {
  try {
    const res = await axiosInstance.post("/1.0/inspection/create", body);
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};


export const findAllInspection = async (search: string,page: any) => {
  try {

    let queryParams: any = null;

    if(search){
      queryParams = new URLSearchParams({
        search: search,
        page: page ?? 1,
        limit:10,
      }).toString();
    }else{
      queryParams = new URLSearchParams({
        page: page ?? 1,
        limit:10,
      }).toString();
    }

    const res = await axiosInstance.get("/1.0/inspection/find-all?" + queryParams);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const findInspection = async (inspectionId: string) => {
  try {
    console.log("inspectionId",inspectionId);
    const res = await axiosInstance.get("/1.0/inspection/find/" + inspectionId);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const updateInspection = async (
  inspectionId: number,
  body: InspectionUpdateDto
) => {
  try {
    const res = await axiosInstance.put(
      "/1.0/inspection/update/" + inspectionId,
      body
    );

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const acceptInspection = async (inspectionId: string) => {
  try {
    const res = await axiosInstance.post(
      "/1.0/inspection/" + inspectionId + "/accept"
    );

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const getInspectionSchema = async (inspectionId:string) => {
  try {
    const res = await axiosInstance.get("/1.0/inspection/schema/"+inspectionId);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const saveInspection = async (inspectionId: string, inspection: any) => {
  try {
    const res = await axiosInstance.post(
      "/1.0/inspection/save/" + inspectionId,
      inspection
    );

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};
