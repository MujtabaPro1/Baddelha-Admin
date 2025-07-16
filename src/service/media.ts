import axiosInstance from "./api";
import { axiosErrorHandler } from "../types/utils";


export const createMedia = async (
  file: File,
  additionalData?: Record<string, any>
) => {
  // Creating a FormData object
  const formData = new FormData();

  // Appending the file to formData. 'file' is the key expected by the server for the file
  formData.append("file", file);

  // If there are additional data, append them to formData
  if (additionalData) {
    for (const key in additionalData) {
      if (additionalData.hasOwnProperty(key)) {
        formData.append(key, additionalData[key]);
      }
    }
  }

  try {
    // Making an HTTP POST request with formData
    const res = await axiosInstance.post("/api/1.0/media/upload", formData, {
      headers: {
        // Informing the server that the request contains form data
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const findAllMedia = async (search: string, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      search: search,
      page: page.toString(),
      limit: limit.toString(),
    }).toString();
    const res = await axiosInstance.get("/api/1.0/car/find-all?" + queryParams);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};
export const findMedia = async (carId: number) => {
  try {
    const res = await axiosInstance.get("/api/1.0/car/find/" + carId);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};

export const updateMedia = async (carId: string, body: any) => {
  try {
    const res = await axiosInstance.put("/api/1.0/car/update/" + carId, body);

    return res.data;
  } catch (ex: any) {
    return axiosErrorHandler(ex);
  }
};
