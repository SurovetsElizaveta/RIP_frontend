import { Api } from './api';

type SecurityData = { token?: string };

// Экземпляр типизированного API‑клиента с поддержкой Bearer‑токена.
// baseURL указывает на проксируемый путь Vite (`/api`), чтобы избежать CORS в dev.
export const api = new Api<SecurityData>({
  baseURL: '/api',
  secure: true,
  securityWorker: (securityData) => {
    if (!securityData?.token) return {};
    return {
      headers: {
        Authorization: `Bearer ${securityData.token}`,
      },
    };
  },
});

export const setApiToken = (token: string | null) => {
  api.setSecurityData({ token: token ?? undefined });
};

// Инициализация токена из localStorage (если он уже сохранён)
if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem('access_token');
  if (stored) {
    setApiToken(stored);
  }
}

