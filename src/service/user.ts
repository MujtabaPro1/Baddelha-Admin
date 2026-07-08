import axiosInstance from "./api";

const SYNCED_FCM_TOKEN_KEY = "fcm_token_synced";

export const updateFcmToken = async (fcmToken: string) => {
  if (localStorage.getItem(SYNCED_FCM_TOKEN_KEY) === fcmToken) {
    return null;
  }
  const res = await axiosInstance.post("/1.0/user/update-fcm-token", { fcmToken });
  localStorage.setItem(SYNCED_FCM_TOKEN_KEY, fcmToken);
  return res.data;
};
