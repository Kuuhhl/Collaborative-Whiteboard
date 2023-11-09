import express from "express";
import { Server } from "socket.io";
import { createAdapter } from "socket.io-redis";
import { createClient } from "redis";
import {
	checkSession,
	removeSession,
	addSession,
	getRoomElements,
	addElementToRoom,
	removeElementFromRoom,
} from "./databaseClient.js";
import http from "http";
const app = express();
const server = http.createServer(app);

app.get("/joinRoom", (req, res) => {
	// get sessionid and roomcode
	const sessionId = req.sessionId;
	const roomCode = req.query.roomCode;

	// logout first before joining new room
	// if user exists
	if (!checkSession(sessionId)) {
		removeSession(sessionId);
	}

	// check if room exists
	if (!roomCode) {
		res.status(400).send("Room does not exist");
		return;
	}

	// add user to room
	addSession({ sessionId: sessionId, roomCode: req.query.roomCode });

	// send all elements in room to user
	res.status(200).send(getRoomElements(roomCode));
});
const io = new Server();

// redis adapter to share websocket connections across multiple instances of the server
const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// send updates to all users in the room
io.on("connection", (socket) => {
	socket.on("update", (sessionId, update) => {
		if (checkSession(sessionId)) {
			if (update.action === "add") {
				addElementToRoom(sessionId, update.element);
			} else if (update.action === "remove") {
				removeElementFromRoom(sessionId, update.element);
			}
			io.to(update.room).emit("update", update);
		} else {
			socket.emit("error", { code: 401, message: "Invalid session ID" });
		}
	});
});

server.listen(39291, () => {
	console.log("server running at ws://localhost:39291/");
});
