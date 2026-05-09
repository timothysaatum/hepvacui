import api from './api';
import type { Device, ApproveDevicePayload, DeviceStatus } from '../types/device';

export const deviceService = {
  getPendingDevices: async (facilityId?: string): Promise<Device[]> => {
    const params = facilityId ? { facility_id: facilityId } : {};
    const response = await api.get('/api/v1/security/devices/pending', { params });
    return response.data;
  },

  getAllDevices: async (status?: DeviceStatus, facilityId?: string): Promise<Device[]> => {
    const params = {
      ...(status ? { status } : {}),
      ...(facilityId ? { facility_id: facilityId } : {}),
    };
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
