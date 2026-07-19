import axiosInstance from './api';
import {
  DevicePlatform,
  FindAllNotificationsParams,
  FindAllNotificationsResponse,
  NotificationItem,
  TestNotificationResponse,
} from '../types/notification';

const BASE = '/1.0/notification';
const SYNCED_DEVICE_TOKEN_KEY = 'fcm_token_synced';

export const findAllNotifications = async (
  params: FindAllNotificationsParams = {}
): Promise<FindAllNotificationsResponse> => {
  const res = await axiosInstance.get(`${BASE}/find-all`, { params });
  return res.data;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const res = await axiosInstance.get(`${BASE}/unread-count`);
  return res.data?.count ?? 0;
};

export const markNotificationSeen = async (id: string): Promise<NotificationItem> => {
  const res = await axiosInstance.patch(`${BASE}/${id}/seen`);
  return res.data;
};

export const markAllNotificationsSeen = async (): Promise<number> => {
  const res = await axiosInstance.patch(`${BASE}/seen-all`);
  return res.data?.count ?? 0;
};

export const registerDeviceToken = async (token: string, platform: DevicePlatform) => {
  const res = await axiosInstance.post(`${BASE}/device/register`, { token, platform });
  return res.data;
};

export const removeDeviceToken = async (token: string) => {
  const res = await axiosInstance.delete(`${BASE}/device/remove/${encodeURIComponent(token)}`);
  return res.data;
};

export const sendTestNotification = async (): Promise<TestNotificationResponse> => {
  const res = await axiosInstance.post(`${BASE}/test`);
  return res.data;
};

// Registers a device token, skipping the call if this exact token was already
// synced (register/device is an upsert so re-calling is harmless, but this
// avoids a network round trip on every mount for an unchanged token).
export const syncDeviceToken = async (token: string, platform: DevicePlatform = 'WEB') => {
  if (localStorage.getItem(SYNCED_DEVICE_TOKEN_KEY) === token) {
    return null;
  }
  const result = await registerDeviceToken(token, platform);
  localStorage.setItem(SYNCED_DEVICE_TOKEN_KEY, token);
  return result;
};

// Clears the local "already synced" guard so the next login (possibly a
// different user on a shared device) re-registers the token and reclaims
// ownership of it, per the device/register upsert-by-token semantics.
export const clearSyncedDeviceToken = () => {
  localStorage.removeItem(SYNCED_DEVICE_TOKEN_KEY);
};

// The API's `data` deep-link payload doesn't carry a route, only ids — the
// client is expected to know how to route based on which keys are present.
export const resolveNotificationLink = (
  notification: Pick<NotificationItem, 'data'>
): string | undefined => {
  const data = notification.data || {};
  if (data.inspectionId) return `/inspections/${data.inspectionId}`;
  if (data.appointmentId) return `/appointments/${data.appointmentId}`;
  if (data.carId) return `/cars/details/${data.carId}`;
  return undefined;
};
