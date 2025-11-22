import { combineReducers, configureStore } from "@reduxjs/toolkit"
import filterReducer from "./slices/filterSlice"

export default configureStore({
    reducer: combineReducers({
        filter: filterReducer
    })
})