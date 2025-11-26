import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { logoutUserAsync } from "./userSlice";

const filterSlice = createSlice({
    name: "filter",
    initialState: {
        minDistance: '',
        maxDistance: '',
    },
    reducers: {
        setMinDistance: (state, {payload}) => {
            state.minDistance = payload;
        },
        setMaxDistance: (state, {payload}) => {
            state.maxDistance = payload;
        },
        resetFilters: (state) => {
            state.minDistance = '';
            state.maxDistance = '';
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logoutUserAsync.fulfilled, (state) => {
            state.minDistance = '';
            state.maxDistance = '';
        });
    }
})

export const useMinDistance = () =>
    useSelector((state: { filter: { minDistance: string } }) => state.filter.minDistance)

export const useMaxDistance = () =>
    useSelector((state: { filter: { maxDistance: string } }) => state.filter.maxDistance)

export const {
    setMinDistance: setMinDistanceAction,
    setMaxDistance: setMaxDistanceAction,
    resetFilters: resetFiltersAction
} = filterSlice.actions

export default filterSlice.reducer