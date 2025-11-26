import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import type { DsRoute } from '../api/api';
import type { Route } from '../types/types';

export interface RoutesState {
  items: Route[];
  current: Route | null;
  loadingList: boolean;
  loadingCurrent: boolean;
  error: string | null;
}

const initialState: RoutesState = {
  items: [],
  current: null,
  loadingList: false,
  loadingCurrent: false,
  error: null,
};

const mapDsRouteToRoute = (r: DsRoute): Route => ({
  RouteID: r.RouteID ?? 0,
  Title: r.Title ?? '',
  Distance: r.Distance ?? 0,
  Description: r.Description ?? '',
  ImageURL: r.ImageURL ?? '/images/default_route.svg',
  Status: r.Status ?? '',
  Delay: r.Delay ?? 0,
});

export const fetchRoutesList = createAsyncThunk(
  'routes/fetchRoutesList',
  async (
    params: { minDistance?: number; maxDistance?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.routes.routesList({
        min_distance: params.minDistance,
        max_distance: params.maxDistance,
      });
      
      const data = (response.data ?? []) as DsRoute[];
      const mappedData = data.map(mapDsRouteToRoute);
      
      return mappedData;
    } catch (e) {
      console.error('Error fetching routes:', e);
      return rejectWithValue('Ошибка при загрузке маршрутов');
    }
  },
);

export const fetchRouteById = createAsyncThunk(
  'routes/fetchRouteById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.routes.routesDetail(id);
      const data = response.data as DsRoute;
      return mapDsRouteToRoute(data);
    } catch (e) {
      return rejectWithValue('Ошибка при загрузке маршрута');
    }
  },
);

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutesList.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchRoutesList.fulfilled, (state, action) => {
        state.loadingList = false;
        state.items = action.payload;
      })
      .addCase(fetchRoutesList.rejected, (state, action) => {
        state.loadingList = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при загрузке маршрутов';
      })
      .addCase(fetchRouteById.pending, (state) => {
        state.loadingCurrent = true;
        state.error = null;
      })
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        state.current = action.payload;
      })
      .addCase(fetchRouteById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при загрузке маршрута';
      });
  },
});

export default routesSlice.reducer;


