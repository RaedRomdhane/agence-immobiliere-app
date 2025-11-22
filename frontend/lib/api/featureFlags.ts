import apiClient from './client';

export interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targeting: {
    emails: string[];
    userIds: string[];
    roles: string[];
    percentage: number;
  };
  createdBy: string;
  updatedBy: string;
  lastToggledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagDto {
  key: string;
  name: string;
  description: string;
  enabled?: boolean;
  targeting?: {
    emails?: string[];
    userIds?: string[];
    roles?: string[];
    percentage?: number;
  };
}

export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  targeting?: {
    emails?: string[];
    userIds?: string[];
    roles?: string[];
    percentage?: number;
  };
}

export interface WhitelistDto {
  emails?: string[];
  userIds?: string[];
}

const featureFlagsApi = {
  /**
   * Get all feature flags (admin only)
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    const response = await apiClient.get('/feature-flags');
    return response.data.data;
  },

  /**
   * Get feature flags for current user
   */
  async getMyFlags(): Promise<Record<string, boolean>> {
    const response = await apiClient.get('/feature-flags/my-flags');
    return response.data.data;
  },

  /**
   * Get a specific feature flag by key
   */
  async getFlag(key: string): Promise<FeatureFlag> {
    const response = await apiClient.get(`/feature-flags/${key}`);
    return response.data.data;
  },

  /**
   * Create a new feature flag (admin only)
   */
  async createFlag(data: CreateFeatureFlagDto): Promise<FeatureFlag> {
    const response = await apiClient.post('/feature-flags', data);
    return response.data.data;
  },

  /**
   * Update a feature flag (admin only)
   */
  async updateFlag(key: string, data: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    const response = await apiClient.put(`/feature-flags/${key}`, data);
    return response.data.data;
  },

  /**
   * Toggle a feature flag on/off (admin only)
   */
  async toggleFlag(key: string): Promise<FeatureFlag> {
    const response = await apiClient.patch(`/feature-flags/${key}/toggle`);
    return response.data.data;
  },

  /**
   * Delete a feature flag (admin only)
   */
  async deleteFlag(key: string): Promise<void> {
    await apiClient.delete(`/feature-flags/${key}`);
  },

  /**
   * Add users to whitelist (admin only)
   */
  async addToWhitelist(key: string, data: WhitelistDto): Promise<FeatureFlag> {
    const response = await apiClient.post(`/feature-flags/${key}/whitelist`, data);
    return response.data.data;
  },

  /**
   * Remove users from whitelist (admin only)
   */
  async removeFromWhitelist(key: string, data: WhitelistDto): Promise<FeatureFlag> {
    const response = await apiClient.delete(`/feature-flags/${key}/whitelist`, { data });
    return response.data.data;
  },

  /**
   * Check if a flag is enabled for current user
   */
  async checkFlag(key: string): Promise<boolean> {
    const response = await apiClient.get(`/feature-flags/${key}/check`);
    return response.data.data.enabled;
  },
};

export default featureFlagsApi;
