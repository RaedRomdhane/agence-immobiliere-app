// lib/api/appointments.ts
import apiClient from './client';

export async function getUserAppointmentsCount(): Promise<number> {
  try {
    const res = await apiClient.get('/appointments/user');
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data.length;
    }
    return 0;
  } catch {
    return 0;
  }
}
