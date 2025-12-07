import apiClient from './client';

export const favoritesApi = {
  /**
   * Add a property to user's favorites
   */
  addFavorite: async (userId: string, propertyId: string) => {
    const response = await apiClient.post(`/users/${userId}/favorites`, { propertyId });
    return response.data;
  },

  /**
   * Remove a property from user's favorites
   */
  removeFavorite: async (userId: string, propertyId: string) => {
    // Axios allows sending a request body with DELETE via the config object
    const response = await apiClient.delete(`/users/${userId}/favorites`, { data: { propertyId } });
    return response.data;
  },
  /**
   * Update the order of user's favorites
   */
  updateFavoritesOrder: async (userId: string, favorites: string[]) => {
    const response = await apiClient.patch(`/users/${userId}/favorites/order`, { favorites });
    return response.data;
  },
  /**
   * Get all favorite properties for a user
   */
  getFavoriteProperties: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/favorites/properties`);
    return response.data;
  },
};
