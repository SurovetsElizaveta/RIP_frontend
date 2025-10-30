import type { Route } from '../types/types';

const API_BASE = '/api';

// Mock данные
export const ROUTES_MOCK: Route[] = [
  {
    RouteID: 1,
    Title: "Владивосток - Сямынь",
    Distance: 2574,
    Description: "Сервис FESCO China Direct Line (FCDL) осуществляет перевозки целого спектра товаров",
    Status: "действует",
    Delay: 56,
    ImageURL: "/images/default_route.svg"
  },
  {
    RouteID: 2,
    Title: "Санкт-Петербург - Шанхай",
    Distance: 21792,
    Description: "Суда FESCO Baltorient Line (FBOL) везут товары по маршруту Санкт-Петербург — Нава-Шева* — Циндао",
    Status: "действует",
    Delay: 72,
    ImageURL: "/images/default_route.svg"
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