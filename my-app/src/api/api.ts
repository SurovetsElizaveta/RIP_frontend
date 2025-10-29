import type { Route } from '../types/types';

const API_BASE = '/api';

// Mock данные
export const ROUTES_MOCK: Route[] = [
  {
    RouteID: 1,
    Title: "Маршрут Владивосток - Находка",
    Distance: 150,
    Description: "Морской маршрут между портами Владивосток и Находка",
    Status: "действует",
    Delay: 2
  },
  {
    RouteID: 2,
    Title: "Маршрут Находка - Восточный",
    Distance: 80,
    Description: "Короткий маршрут между портами Находка и Восточный",
    Status: "действует",
    Delay: 1
  }
];

export const getRoutes = async (minDistance?: number, maxDistance?: number): Promise<Route[]> => {
  try {
    const params = new URLSearchParams();
    if (minDistance) params.append('min_distance', minDistance.toString());
    if (maxDistance) params.append('max_distance', maxDistance.toString());
    
    const response = await fetch(`${API_BASE}/routes?${params}`);
    if (!response.ok) throw new Error('Network error');
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to error:', error);
    let filteredRoutes = ROUTES_MOCK;
    
    if (minDistance) {
      filteredRoutes = filteredRoutes.filter(route => route.Distance >= minDistance);
    }
    if (maxDistance) {
      filteredRoutes = filteredRoutes.filter(route => route.Distance <= maxDistance);
    }
    
    return filteredRoutes;
  }
};

export const getRouteById = async (id: number): Promise<Route> => {
  try {
    const response = await fetch(`${API_BASE}/routes/${id}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to error:', error);
    const route = ROUTES_MOCK.find(r => r.RouteID === id);
    if (!route) throw new Error('Route not found');
    return route;
  }
};

export const getDraftInfo = async (): Promise<{draft_id: number | null, count: number}> => {
  try {
    const response = await fetch(`${API_BASE}/speedrequests/draft`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.warn('Using mock draft data due to error:', error);
    return { draft_id: null, count: 0 };
  }
};