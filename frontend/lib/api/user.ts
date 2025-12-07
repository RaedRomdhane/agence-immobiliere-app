import apiClient from './client';

export interface LastPropertySearchCriteria {
  [key: string]: any;
}

export const userApi = {
  /**
   * Get last property search criteria for a user
   */
  getLastPropertySearchCriteria: async (userId: string): Promise<LastPropertySearchCriteria | null> => {
    const response = await apiClient.get(`/users/${userId}/last-search-criteria`);
    return response.data ?? null;
  },

  /**
   * Set last property search criteria for a user
   */
  setLastPropertySearchCriteria: async (userId: string, criteria: LastPropertySearchCriteria): Promise<LastPropertySearchCriteria> => {
    const response = await apiClient.post(`/users/${userId}/last-search-criteria`, criteria);
    return response.data?.data;
  },

  /**
   * Get user statistics for admin dashboard
   */
  getUserStats: async (token?: string) => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await apiClient.get('/users/stats', { headers });
    // API returns { message: { total, active, byRole }, ... }
    return response.data?.message;
  },

  /**
   * Get all users (admin)
   */
  getAllUsers: async (params: any = {}, token?: string) => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await apiClient.get('/users', { params, headers });
    // API returns { message: [ ...users ], data: { ...pagination } }
    return response.data?.message;
  },

  /**
   * Get all active agents
   */
  getActiveAgents: async () => {
    const response = await apiClient.get('/users/agents');
    // API returns { data: [ ...agents ], ... }
    return response.data?.data;
  },
};
