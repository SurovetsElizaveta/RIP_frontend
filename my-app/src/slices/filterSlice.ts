import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

interface FilterState {
  minDistance: number | null;
  maxDistance: number | null;
}

const loadFiltersFromStorage = (): FilterState => {
  try {
    const saved = localStorage.getItem('routeFilters');
    return saved ? JSON.parse(saved) : { minDistance: null, maxDistance: null };
  } catch {
    return { minDistance: null, maxDistance: null };
  }
};

const filterSlice = createSlice({
  name: "filters",
  initialState: loadFiltersFromStorage(),
  reducers: {
    setDistanceFilter(state, { payload }) {
      state.minDistance = payload.minDistance;
      state.maxDistance = payload.maxDistance;
      localStorage.setItem('routeFilters', JSON.stringify(state));
    },
    clearFilters(state) {
      state.minDistance = null;
      state.maxDistance = null;
      localStorage.removeItem('routeFilters');
    }
  }
});

export const useFilters = () =>
  useSelector((state: { filters: FilterState }) => state.filters);

export const {
  setDistanceFilter: setDistanceFilterAction,
  clearFilters: clearFiltersAction
} = filterSlice.actions;

export default filterSlice.reducer;