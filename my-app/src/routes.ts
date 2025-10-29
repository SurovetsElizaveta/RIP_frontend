export const ROUTES = {
  HOME: "/",
  ROUTES: "/routes",
  ROUTE_DETAILS: "/routes/:id",
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  ROUTES: "Маршруты",
  ROUTE_DETAILS: "Детали маршрута",
};