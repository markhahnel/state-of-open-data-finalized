import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SurveyData, DataInventory } from '../types';

interface DataState {
  surveyData: SurveyData[];
  dataInventory: DataInventory | null;
  loading: boolean;
  error: string | null;
  selectedYears: number[];
}

const initialState: DataState = {
  surveyData: [],
  dataInventory: null,
  loading: false,
  error: null,
  selectedYears: [],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSurveyData: (state, action: PayloadAction<SurveyData[]>) => {
      state.surveyData = action.payload;
    },
    setDataInventory: (state, action: PayloadAction<DataInventory>) => {
      state.dataInventory = action.payload;
    },
    setSelectedYears: (state, action: PayloadAction<number[]>) => {
      state.selectedYears = action.payload;
    },
    addSurveyData: (state, action: PayloadAction<SurveyData>) => {
      const existingIndex = state.surveyData.findIndex(
        data => data.year === action.payload.year
      );
      if (existingIndex >= 0) {
        state.surveyData[existingIndex] = action.payload;
      } else {
        state.surveyData.push(action.payload);
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSurveyData,
  setDataInventory,
  setSelectedYears,
  addSurveyData,
} = dataSlice.actions;

export default dataSlice.reducer;