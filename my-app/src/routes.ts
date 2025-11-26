export const ROUTES = {
  HOME: "/",
  ROUTES: "/routes",
  ROUTE_DETAILS: "/routes/:id",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  REQUESTS: "/requests",
  REQUEST_DETAILS: "/requests/:id",
  DRAFT: "/draft",
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  ROUTES: "Маршруты",
  ROUTE_DETAILS: "Детали маршрута",
  LOGIN: "Вход",
  REGISTER: "Регистрация",
  PROFILE: "Личный кабинет",
  REQUESTS: "Мои заявки",
  REQUEST_DETAILS: "Заявка",
  DRAFT: "Черновик",
};