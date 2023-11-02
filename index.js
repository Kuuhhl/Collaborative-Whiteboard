import express from "express";
import { Server } from "socket.io";
import http from "http";
import {
	getElementByUUID,
	getElementsInRoom,
	addElementToRoom,
	deleteElementByUUID,
	updateElementByUUID,
	getRoomCodes,
} from "./mongo";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// contains temporary data that does
// not have to persist across server restarts
class TemporaryState {
	constructor() {
		this.joinedUsers = [];
	}

	getRoomCode(socketId) {
		const user = this.joinedUsers.find(
			(user) => user.socketId === socketId
		);
		return user ? user.roomCode : null;
	}
	broadcastToRoom(roomCode, event, data) {
		// get all socket ids in room
		const socketIds = this.joinedUsers
			.filter((user) => user.roomCode === roomCode)
			.map((user) => user.socketId);

		// send event to all sockets in room
		socketIds.forEach((socketId) => {
			io.to(socketId).emit(event, data);
		});
	}
}

// show list of roomcodes in json format endpoint
app.get("/roomcodes", async (req, res) => {
	const roomCodes = await getRoomCodes();
	res.json(roomCodes);
});

socket.on("connection", (socket) => {
	socket.on("joinRoom", async (roomCode) => {
		// add user to room
		state.joinedUsers.push({ socketId: socket.id, roomCode });

		// send all elements in room to user
		const roomElements = await getElementsInRoom(roomCode);
		socket.emit("initialData", roomElements);
	});

	socket.on("add", async (roomCode, uuid, value) => {
		// add element to room
		await addElementToRoom(roomCode, uuid, value);

		// transmit new element to everyone in room
		const newElement = await getElementByUUID(roomCode, uuid);
		state.broadcastToRoom(roomCode, "addElement", newElement);
	});

	socket.on("remove", async (uuid) => {
		// get room code of current socket
		const roomCode = state.getRoomCode(socket.id);

		// remove uuid from room
		await deleteElementByUUID(roomCode, uuid);

		// transmit deletion to everyone in room
		if (roomCode) {
			state.broadcastToRoom(roomCode, "removeElement", uuid);
		}
	});

	socket.on("update", async (uuid, new_value) => {
		// get room code of current socket
		const roomCode = state.getRoomCode(socket.id);

		// update uuid in room
		await updateElementByUUID(roomCode, uuid, new_value);

		// transmit update to everyone in room
		if (roomCode) {
			state.broadcastToRoom(roomCode, "updateElement", {
				uuid,
				new_value,
			});
		}
	});
});

const state = new TemporaryState();

server.listen(39291, () => {
	console.log("server running at ws://localhost:39291/");
});
