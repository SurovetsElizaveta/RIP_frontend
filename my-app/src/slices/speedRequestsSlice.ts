import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import type {
  CompleteSpeedRequestParams,
  DtoSpeedRequest,
  DtoSpeedRequestDetailedResponse,
} from '../api/api';
import { logoutUserAsync } from './userSlice';
import { formatDateForBackend } from '../api/dateFormatter'

export type SpeedRequestStatus = 'сформирована' | 'завершена' | 'отклонена' | string;

export interface SpeedRequestsState {
  draftId: number | null;
  draftCount: number;
  loadingDraft: boolean;
  list: DtoSpeedRequest[];
  loadingList: boolean;
  current: DtoSpeedRequestDetailedResponse | null;
  loadingCurrent: boolean;
  error: string | null;
}

const initialState: SpeedRequestsState = {
  draftId: null,
  draftCount: 0,
  loadingDraft: false,
  list: [],
  loadingList: false,
  current: null,
  loadingCurrent: false,
  error: null,
};

export const fetchDraftInfo = createAsyncThunk(
  'speedRequests/fetchDraftInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.speedrequests.draftList();
      const data = response.data as { draft_id?: number | null; count?: number };
      
      return {
        draftId: data.draft_id ?? null,
        draftCount: data.count ?? 0,
      };
    } catch (e) {
      console.error('Error fetching draft:', e);
      return rejectWithValue('Ошибка при загрузке черновика');
    }
  },
);

export const fetchSpeedRequestsList = createAsyncThunk(
  'speedRequests/fetchSpeedRequestsList',
  async (
    params: { 
      dateFrom?: string;
      dateTo?: string;
      status?: string;
    } = {}, 
    { rejectWithValue }
  ) => {
    try {
      const response = await api.speedrequests.speedrequestsList({
        date_from: params.dateFrom ? formatDateForBackend(params.dateFrom) : undefined,
        date_to: params.dateTo ? formatDateForBackend(params.dateTo) : undefined,
        status: params.status,
      });
      return (response.data ?? []) as DtoSpeedRequest[];
    } catch (e) {
      return rejectWithValue('Ошибка при загрузке заявок');
    }
  },
);

export const fetchSpeedRequestById = createAsyncThunk(
  'speedRequests/fetchSpeedRequestById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.speedrequests.speedrequestsDetail(id);
      return response.data as DtoSpeedRequestDetailedResponse;
    } catch (e) {
      return rejectWithValue('Ошибка при загрузке заявки');
    }
  },
);

export const addRouteToDraft = createAsyncThunk(
  'speedRequests/addRouteToDraft',
  async (routeId: number, { dispatch, rejectWithValue }) => {
    try {
      await api.draft.addrouteCreate(routeId);
      await dispatch(fetchDraftInfo());
      return;
    } catch (e) {
      return rejectWithValue('Ошибка при добавлении маршрута в заявку');
    }
  },
);

export const updateSpeedRequestDepartureDate = createAsyncThunk(
  'speedRequests/updateSpeedRequestDepartureDate',
  async (
    { id, departureDate }: { id: number; departureDate: string },
    { rejectWithValue },
  ) => {
    try {
      const formattedDate = formatDateForBackend(departureDate);
      
      if (!formattedDate) {
        return rejectWithValue('Неверный формат даты');
      }

      await api.speedrequests.speedrequestsUpdate(id, {
        body: {
          departure_date: formattedDate,
        },
      });
      
      return { id, departureDate: formattedDate };
    } catch (e: any) {
      console.error('Error updating departure date:', e);
      const errorMessage = e.response?.data?.error || 'Ошибка при обновлении даты отправления';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateRouteArrivalDate = createAsyncThunk(
  'speedRequests/updateRouteArrivalDate',
  async (
    {
      speedRequestId,
      routeId,
      arrivalDate,
    }: { speedRequestId: number; routeId: number; arrivalDate: string },
    { rejectWithValue },
  ) => {
    try {
      const formattedDate = formatDateForBackend(arrivalDate);

      await api.routespeedrequests.routespeedrequestsUpdate({
        body: {
          speed_request_id: speedRequestId,
          route_id: routeId,
          arrival_date: formattedDate,
        },
      });

      return { speedRequestId, routeId, arrivalDate: formattedDate };
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || 'Ошибка при обновлении даты прибытия';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteRouteFromSpeedRequest = createAsyncThunk(
  'speedRequests/deleteRouteFromSpeedRequest',
  async (
    { speedRequestId, routeId }: { speedRequestId: number; routeId: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await api.routespeedrequests.routespeedrequestsDelete({
        body: {
          speed_request_id: speedRequestId,
          route_id: routeId,
        },
      } as any);
      await dispatch(fetchDraftInfo());
      return { speedRequestId, routeId };
    } catch (e) {
      return rejectWithValue('Ошибка при удалении маршрута из заявки');
    }
  },
);

export const deleteSpeedRequest = createAsyncThunk(
  'speedRequests/deleteSpeedRequest',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await api.speedrequests.speedrequestsDelete(id);
      await dispatch(fetchDraftInfo());
      return id;
    } catch (e) {
      return rejectWithValue('Ошибка при удалении заявки');
    }
  },
);

export const submitSpeedRequest = createAsyncThunk(
  'speedRequests/submitSpeedRequest',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await api.speedrequests.submitUpdate(id);
      await dispatch(fetchDraftInfo());
      return id;
    } catch (e) {
      return rejectWithValue('Ошибка при формировании заявки');
    }
  },
);

export const completeSpeedRequest = createAsyncThunk(
  'speedRequests/completeSpeedRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      // Используйте правильный тип параметров
      await api.speedrequests.completeUpdate(id, {
        body: {
          status: 'завершена'
        }
      } as CompleteSpeedRequestParams);
      return id;
    } catch (e: any) {
      console.error('Error completing speed request:', e);
      const errorMessage = e.response?.data?.error || 'Ошибка при завершении заявки';
      return rejectWithValue(errorMessage);
    }
  },
);

export const rejectSpeedRequest = createAsyncThunk(
  'speedRequests/rejectSpeedRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.speedrequests.completeUpdate(id, {
        body: {
          status: 'отклонена'
        }
      } as CompleteSpeedRequestParams);
      return id;
    } catch (e: any) {
      console.error('Error rejecting speed request:', e);
      const errorMessage = e.response?.data?.error || 'Ошибка при отклонении заявки';
      return rejectWithValue(errorMessage);
    }
  },
);

const speedRequestsSlice = createSlice({
  name: 'speedRequests',
  initialState,
  reducers: {
    clearDraftState: (state) => {
      state.draftId = null;
      state.draftCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDraftInfo.pending, (state) => {
        state.loadingDraft = true;
        state.error = null;
      })
      .addCase(fetchDraftInfo.fulfilled, (state, action) => {
        state.loadingDraft = false;
        state.draftId = action.payload.draftId;
        state.draftCount = action.payload.draftCount;
      })
      .addCase(fetchDraftInfo.rejected, (state, action) => {
        state.loadingDraft = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при загрузке черновика';
      })
      .addCase(fetchSpeedRequestsList.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchSpeedRequestsList.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload;
      })
      .addCase(fetchSpeedRequestsList.rejected, (state, action) => {
        state.loadingList = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при загрузке заявок';
      })
      .addCase(fetchSpeedRequestById.pending, (state) => {
        state.loadingCurrent = true;
        state.error = null;
      })
      .addCase(fetchSpeedRequestById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        state.current = action.payload;
      })
      .addCase(fetchSpeedRequestById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.error =
          (action.payload as string) ?? 'Ошибка при загрузке заявки';
      })
      .addCase(completeSpeedRequest.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.map((req) =>
          req.id === id ? { ...req, status: 'завершена' } : req,
        );
        if (state.current?.speed_request?.id === id) {
          state.current = {
            ...state.current,
            speed_request: {
              ...state.current.speed_request,
              status: 'завершена',
            },
          };
        }
      })
      .addCase(rejectSpeedRequest.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.map((req) =>
          req.id === id ? { ...req, status: 'отклонена' } : req,
        );
        if (state.current?.speed_request?.id === id) {
          state.current = {
            ...state.current,
            speed_request: {
              ...state.current.speed_request,
              status: 'отклонена',
            },
          };
        }
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.draftId = null;
        state.draftCount = 0;
        state.list = [];
        state.current = null;
      });
  },
});

export const { clearDraftState } = speedRequestsSlice.actions;

export default speedRequestsSlice.reducer;


