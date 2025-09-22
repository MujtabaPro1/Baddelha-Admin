import { axiosErrorHandler } from "../types/utils";
import axiosInstance from "./api";

export const findAllTradeInAppointments = async (search: string, page: any) => {
  try {
    let queryParams: any = null;

    if(search){
      queryParams = new URLSearchParams({
        search: search,
        page: (page ?? 1).toString(),
        limit: '10',
      }).toString();
    } else {
      queryParams = new URLSearchParams({
        page: (page ?? 1).toString(),
        limit: '10',
      }).toString();
    }

    const res = await axiosInstance.get("/1.0/trade/appointment/find-all?" + queryParams);
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const findTradeInAppointment = async (appointmentId: string) => {
  try {
    const res = await axiosInstance.get("/1.0/trade/appointment/find/" + appointmentId);
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const updateTradeInAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    const res = await axiosInstance.put(
      `/1.0/trade/appointment/${appointmentId}/status`,
      { status }
    );
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};
