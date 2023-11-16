import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	tool: null,
	elements: [],
	offline_mode: false,
};

const whiteboardSlice = createSlice({
	name: "whiteboard",
	initialState,
	reducers: {
		setToolType: (state, action) => {
			state.tool = action.payload;
		},
		setOfflineMode: (state, action) => {
			state.offline_mode = action.payload;
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

			// add elements to local storage if in offline mode
			if (state.offline_mode) {
				localStorage.setItem(
					"elements",
					JSON.stringify(action.payload)
				);
			}
		},
	},
});

export const { setToolType, setOfflineMode, updateElement, setElements } =
	whiteboardSlice.actions;

export default whiteboardSlice.reducer;
