import io from "socket.io-client";
import { store } from "../../../store/store";
import { updateOrSetElements } from "../whiteboardSlice";

let socket;

export const connectToServer = () => {
	socket = io(window.BACKEND_BASE_URL, {
		withCredentials: true,
		transports: ["websocket"],
	});
};

export const sendUpdateMessage = (payload) => {
	if (!socket) {
		throw new Error("Must connect to server before sending messages");
	}

	socket.emit("update", { element: payload });
};

export const listenToUpdateMessage = () => {
	if (!socket) {
		throw new Error("Must connect to server before listening to messages");
	}

	socket.on("update", (payload) => {
		store.dispatch(
			updateOrSetElements({ payload: payload, myOwnChange: false })
		);
	});
};
