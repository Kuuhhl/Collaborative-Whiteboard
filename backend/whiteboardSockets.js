import cookie from "cookie";

export function registerWhiteboardSockets(io, db) {
	// register the socket connection,
	// which means checking if valid session and also
	// adding metadata like roomkey and sessionid to socket.
	io.use(async (socket, next) => {
		try {
			const { sessionId } = cookie.parse(socket.handshake.headers.cookie || "");
			if (!sessionId) return next(new Error("No session id provided"));
			const session = await db.getSession(sessionId);
			if (!session?.room) {
				return next(new Error("Session with your Session-ID does not exist."));
			}
			socket.data.sessionId = sessionId;
			socket.data.roomKey = `whiteboard:${session.room.toString()}`;
			next();
		} catch (error) {
			console.error("Error authenticating socket:", error);
			next(new Error("Could not authenticate session"));
		}
	});

	// join socket-io room
	io.on("connection", (socket) => {
		const { sessionId, roomKey } = socket.data;
		const joined = Promise.resolve(socket.join(roomKey));
		joined.catch((error) => {
			console.error("Error joining whiteboard:", error);
			socket.disconnect(true);
		});

		// send updated elements
		socket.on("update", async (update) => {
			try {
				await joined;
				if (!socket.connected) return;
				// send updates using websockets to other room members
				socket.to(roomKey).emit("update", update.element);
				// update ground truth database
				await db.addOrUpdateElement(sessionId, update.element);
			} catch (error) {
				console.error("Error saving whiteboard update:", error);
				socket.emit("error", "Could not save whiteboard update");
			}
		});
	});
}
