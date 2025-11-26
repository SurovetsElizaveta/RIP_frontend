import { combineReducers, configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slices/filterSlice";
import userReducer from "./slices/userSlice";
import routesReducer from "./slices/routesSlice";
import speedRequestsReducer from "./slices/speedRequestsSlice";

const rootReducer = combineReducers({
  filter: filterReducer,
  user: userReducer,
  routes: routesReducer,
  speedRequests: speedRequestsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;