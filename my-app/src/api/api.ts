import type { Route } from '../types/types';

const YOUR_LOCAL_IP = '192.168.0.55';
const API_BASE = `https://${YOUR_LOCAL_IP}:8080/api`;

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

const filterMockRoutes = (routes: Route[], minDistance?: number, maxDistance?: number): Route[] => {
  let filtered = [...routes];
  if (minDistance) {
    filtered = filtered.filter(route => route.Distance >= minDistance);
  }
  if (maxDistance) {
    filtered = filtered.filter(route => route.Distance <= maxDistance);
  }
  return filtered;
};

export const getRoutes = async (minDistance?: number, maxDistance?: number): Promise<Route[]> => {
  try {
    const params = new URLSearchParams();
    if (minDistance !== undefined) params.append('min_distance', minDistance.toString());
    if (maxDistance !== undefined) params.append('max_distance', maxDistance.toString());
    
    const response = await fetch(`${API_BASE}/routes?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to error:', error);
    return filterMockRoutes(ROUTES_MOCK, minDistance, maxDistance);
  }
};

export const getRouteById = async (id: number): Promise<Route> => {
  try {
    const response = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
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
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Если используете
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock draft data due to error:', error);
    return { draft_id: null, count: 0 };
  }
};