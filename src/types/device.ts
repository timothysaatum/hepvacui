export type DeviceStatus = 'pending' | 'trusted' | 'blocked' | 'suspicious';

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  browser: string;
  os: string;
  device_type: string;
  last_ip_address: string;
  status: DeviceStatus;
  first_seen: string;
  last_seen: string;
  approved_by_id?: string;
  approved_at?: string;
}

export interface ApproveDevicePayload {
  status: DeviceStatus;
  notes?: string;
  expires_in_days?: number;
}