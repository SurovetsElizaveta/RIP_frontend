import type { Route } from '../types/types';

// ВАЖНО: Замените 192.168.1.100 на ваш реальный IP адрес!
const YOUR_LOCAL_IP = '10.165.215.65';
const API_BASE = `https://${YOUR_LOCAL_IP}:8080/api`;

// Mock данные остаются без изменений
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

// Функция для фильтрации mock данных
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

// Основная функция запроса маршрутов
export const getRoutes = async (minDistance?: number, maxDistance?: number): Promise<Route[]> => {
  try {
    const params = new URLSearchParams();
    if (minDistance !== undefined) params.append('min_distance', minDistance.toString());
    if (maxDistance !== undefined) params.append('max_distance', maxDistance.toString());
    
    // ИСПОЛЬЗУЕМ HTTPS вместо прокси
    const response = await fetch(`${API_BASE}/routes?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно для кук/JWT
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to error:', error);
    // Fallback на mock данные
    return filterMockRoutes(ROUTES_MOCK, minDistance, maxDistance);
  }
};

// Получение конкретного маршрута по ID
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

// Получение информации о черновике (всегда возвращает 0)
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
    // Всегда возвращаем 0 как в логике
    return { draft_id: null, count: 0 };
  }
};