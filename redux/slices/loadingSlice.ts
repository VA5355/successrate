import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
};

export const loadingSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    enableLoader: (state) => {
      state.isLoading = true;
    },
    disableLoader: (state) => {
      state.isLoading = false;
    },
  },
});

export const { enableLoader, disableLoader } = loadingSlice.actions;

export default loadingSlice.reducer;
