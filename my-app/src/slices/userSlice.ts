import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setApiToken } from '../api';
import type { DtoAuthResponse } from '../api/api';

export interface UserState {
  username: string;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  username: '',
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
};

export const loginUserAsync = createAsyncThunk(
  'user/loginUserAsync',
  async (
    credentials: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.auth.signinCreate({
        login: credentials.username,
        password: credentials.password,
      });
      const data = response.data as DtoAuthResponse;

      if (data.access_token) {
        window.localStorage.setItem('access_token', data.access_token);
        setApiToken(data.access_token);
      }
      if (data.refresh_token) {
        window.localStorage.setItem('refresh_token', data.refresh_token);
      }

      return data;
    } catch (error) {
      return rejectWithValue('Ошибка авторизации');
    }
  },
);

export const logoutUserAsync = createAsyncThunk(
  'user/logoutUserAsync',
  async (_, { rejectWithValue }) => {
    try {
      await api.auth.signoutCreate();
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
      setApiToken(null);
      return {};
    } catch (error) {
      return rejectWithValue('Ошибка при выходе из системы');
    }
  },
);

export const restoreUserSessionAsync = createAsyncThunk(
  'user/restoreUserSessionAsync',
  async (_, { rejectWithValue }) => {
    try {
      const token = window.localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Устанавливаем токен в API клиент
      setApiToken(token);

      // Получаем информацию о текущем пользователе
      const response = await api.users.getUsers();
      const userData = response.data;

      if (!userData) {
        return rejectWithValue('No user data');
      }

      return {
        username: userData.login || '',
        isModerator: !!userData.is_moderator,
      };
    } catch (error: any) {
      // Если токен невалидный, очищаем его
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('refresh_token');
        setApiToken(null);
      }
      return rejectWithValue('Failed to restore session');
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        const data = (action.payload as DtoAuthResponse) ?? {};
        state.username = data.user?.login ?? '';
        state.isAuthenticated = true;
        state.isModerator = !!data.user?.is_moderator;
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.isModerator = false;
        state.error = (action.payload as string) ?? 'Ошибка авторизации';
      })
      .addCase(logoutUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.username = '';
        state.isAuthenticated = false;
        state.isModerator = false;
        state.error = null;
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при выходе из системы';
      })
      .addCase(restoreUserSessionAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreUserSessionAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.isAuthenticated = true;
        state.isModerator = action.payload.isModerator;
        state.error = null;
      })
      .addCase(restoreUserSessionAsync.rejected, (state) => {
        // Не сбрасываем состояние при ошибке восстановления,
        // чтобы не разлогинивать пользователя при обновлении страницы
        state.loading = false;
        // Оставляем состояние как есть (не authenticated, если токена нет)
      })
      .addCase(signupUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        const data = (action.payload as DtoAuthResponse) ?? {};
        state.username = data.user?.login ?? '';
        state.isAuthenticated = true;
        state.isModerator = !!data.user?.is_moderator;
        state.error = null;
      })
      .addCase(signupUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.isModerator = false;
        state.error = (action.payload as string) ?? 'Ошибка регистрации';
      });
  },
});

export const signupUserAsync = createAsyncThunk(
  'user/signupUserAsync',
  async (
    credentials: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('Sending signup request with:', { 
        login: credentials.username 
      });

      const response = await api.auth.signupCreate({
        login: credentials.username,
        password: credentials.password,
      });
      
      console.log('Signup response:', response);
      
      const data = response.data as DtoAuthResponse;

      if (data.access_token) {
        window.localStorage.setItem('access_token', data.access_token);
        setApiToken(data.access_token);
        console.log('Registration successful, token saved');
      } else {
        console.warn('No access token in signup response');
      }

      return data;
    } catch (error: any) {
      console.error('Signup error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.error || 'Ошибка регистрации';
      return rejectWithValue(errorMessage);
    }
  },
);

export default userSlice.reducer;


