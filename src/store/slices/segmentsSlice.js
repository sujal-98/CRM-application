import { createSlice } from '@reduxjs/toolkit';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

// Initial mock segments (can be replaced by API fetched data later)
const initialState = [
  {
    id: 1,
    name: 'High Value Customers',
    rules: [
      { condition: 'spend', comparator: 'gt', value: 10000 },
      { condition: 'visits', comparator: 'lt', value: 3 },
    ],
    operators: ['AND'],
    audienceSize: 245,
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Inactive Users',
    rules: [
      { condition: 'last_order_date', comparator: 'gt', value: 90 },
    ],
    operators: [],
    audienceSize: 1234,
    createdAt: '2024-03-14T15:45:00Z',
  },
];

const segmentsSlice = createSlice({
  name: 'segments',
  initialState,
  reducers: {
    addSegment: (state, action) => {
      state.push(action.payload);
    },
    deleteSegment: (state, action) => {
      return state.filter((segment) => segment.id !== action.payload);
    },
    updateSegment: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.findIndex((s) => s.id === id);
      if (index !== -1) {
        state[index] = { ...state[index], ...updates };
      }
    },
  },
});

export const { addSegment, deleteSegment, updateSegment } = segmentsSlice.actions;
export default segmentsSlice.reducer; 