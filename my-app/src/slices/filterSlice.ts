import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

interface FilterState {
  minDistance: number | null;
  maxDistance: number | null;
}

const filterSlice = createSlice({
  name: "filters",
  initialState: {
    minDistance: null,
    maxDistance: null,
  } as FilterState,
  reducers: {
    setDistanceFilter(state, { payload }) {
      state.minDistance = payload.minDistance;
      state.maxDistance = payload.maxDistance;
    },
    clearFilters(state) {
      state.minDistance = null;
      state.maxDistance = null;
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