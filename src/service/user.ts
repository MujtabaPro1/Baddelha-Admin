import axiosInstance from "./api";

export const updateFcmToken = async (fcmToken: string) => {
  const res = await axiosInstance.post("/1.0/user/update-fcm-token", { fcmToken });
  return res.data;
};
