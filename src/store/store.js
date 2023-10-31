import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  tool: null,
};

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setToolType: (state, action) => {
      state.tool = action.payload;
    },
  },
});

export const { setToolType } = whiteboardSlice;

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardSlice.reducer,
  },
});
