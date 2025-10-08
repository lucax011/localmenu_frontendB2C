import apiClient from './client';
import { Restaurant, RestaurantDetails } from '../../types/api';

export const restaurantService = {
  /**
   * Fetch all restaurants
   * GET /public/restaurants
   */
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await apiClient.get<Restaurant[]>('/public/restaurants');
    return response.data;
  },

  /**
   * Fetch restaurant details by slug
   * GET /public/r/:slug
   */
  async getRestaurantBySlug(slug: string): Promise<RestaurantDetails> {
    const response = await apiClient.get<RestaurantDetails>(`/public/r/${slug}`);
    return response.data;
  },
};
