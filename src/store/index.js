import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import segmentsReducer from './slices/segmentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    segments: segmentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 