import { sendUpdateMessage } from "./utils/socket";
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

		updateOrSetElements: (state, action) => {
			const { payload, myOwnChange = true } = action.payload;
			const updateOrAddElement = (payloadElement) => {
				const index = state.elements.findIndex(
					(element) => element.id === payloadElement.id
				);
				if (index !== -1) {
					state.elements[index] = payloadElement;
				} else {
					state.elements.push(payloadElement);
				}
			};

			if (Array.isArray(payload)) {
				payload.forEach(updateOrAddElement);
			} else {
				updateOrAddElement(payload);

				if (myOwnChange && !state.offline_mode) {
					sendUpdateMessage(payload);
				}
			}

			if (state.offline_mode) {
				localStorage.setItem(
					"elements",
					JSON.stringify(state.elements)
				);
			}
		},
		clearElements: (state) => {
			state.elements = [];
		},
	},
});

export const {
	setToolType,
	setOfflineMode,
	updateOrSetElements,
	clearElements,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
