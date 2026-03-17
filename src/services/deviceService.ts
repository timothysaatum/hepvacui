import api from './api';
import type { Device, ApproveDevicePayload, DeviceStatus } from '../types/device';

export const deviceService = {
  getPendingDevices: async (): Promise<Device[]> => {
    const response = await api.get('/api/v1/security/devices/pending');
    return response.data;
  },

  getAllDevices: async (status?: DeviceStatus): Promise<Device[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/api/v1/security/devices', { params });
    return response.data;
  },

  getMyDevices: async (): Promise<Device[]> => {
    const response = await api.get('/api/v1/security/devices/my');
    return response.data;
  },

  approveDevice: async (deviceId: string, data: ApproveDevicePayload): Promise<Device> => {
    const response = await api.post(`/api/v1/security/devices/${deviceId}/approve`, data);
    return response.data;
  },

  revokeDevice: async (deviceId: string): Promise<void> => {
    await api.delete(`/api/v1/security/devices/${deviceId}`);
  }
};