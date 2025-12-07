import axios from 'axios';

export async function getRecentAdminActivities(token?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await axios.get(`${apiUrl}/admin/recent-activities`, { headers });
  return res.data?.data;
}
