import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import posReducer from './posSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pos: posReducer,
    ui: uiReducer,
  },
});

export default store;
