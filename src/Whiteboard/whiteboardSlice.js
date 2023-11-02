import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	tool: null,
	elements: [],
};

const whiteboardSlice = createSlice({
	name: "whiteboard",
	initialState,
	reducers: {
		setToolType: (state, action) => {
			state.tool = action.payload;
		},
		updateElement: (state, action) => {
			const { id } = action.payload;

			const index = state.elements.findIndex(
				(element) => element.id === id
			);

			if (index === -1) {
				state.elements.push(action.payload);
			} else {
				// if index will be found
				// update element in our array of elements

				state.elements[index] = action.payload;
			}
		},
		setElements: (state, action) => {
			state.elements = action.payload;
		},
	},
});

export const { setToolType, updateElement, setElements } =
	whiteboardSlice.actions;

export default whiteboardSlice.reducer;
