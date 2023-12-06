import express from "express";
import cookie from "cookie";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import DatabaseClient from "./databaseClient.js";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

// check if all required environment variables are set
const requiredEnvVars = [
	"MONGO_DB_URL",
	"MONGO_DB_NAME",
	"REDIS_HOST",
	"REDIS_PORT",
	"FRONTEND_BASE_URL",
];

requiredEnvVars.forEach((varName) => {
	if (!process.env[varName]) {
		console.error(`${varName} environment variable not set.`);
		process.exit(1);
	}
});
// Initialize app and middleware
const app = express();
app.use(cookieParser());
app.use((req, res, next) => {
	cors({
		origin: process.env.ALLOW_ALL_CORS_ORIGINS
			? req.headers.origin
			: process.env.FRONTEND_BASE_URL,
		credentials: true,
	})(req, res, next);
});
app.use(express.static("public"));
app.use(express.json());

// Initialize database client
const db_client = new DatabaseClient(
	process.env.MONGO_DB_URL,
	process.env.MONGO_DB_NAME
);
await db_client.connect();

// Initialize server
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: (origin, callback) => {
			if (
				process.env.ALLOW_ALL_ORIGINS === "true" ||
				origin === process.env.FRONTEND_BASE_URL
			) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST"],
		credentials: true,
		transports: ["websocket"],
	},
});

// Initialize Redis clients
const redisClient = new Redis({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
});

console.log(
	`Connecting to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
);
redisClient.on("connect", () => {
	console.log("Connected to Redis");
});
redisClient.on("error", (err) => {
	console.error("Error connecting to Redis: ", err);
});
const subClient = redisClient.duplicate();
const pubClient = redisClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Define routes
app.get("/ping", handlePing);
app.post("/joinRoom", handleJoinRoom);
app.post("/createRoom", handleCreateRoom);

// Start server
server.listen(39291, () => {
	const addr = server.address();
	console.log(
		`server running at ws://${addr.address}:${addr.port}/ / http://${addr.address}:${addr.port}/`
	);
});

// Helper functions

function handlePing(req, res) {
	res.status(200).send("pong");
}

async function handleJoinRoom(req, res) {
	// get room code
	const roomCode = req.body.roomCode;

	if (!roomCode) {
		res.status(400).json({ message: "Room code not specified." });
		return;
	}

	// check if room exists
	if (!(await db_client.checkRoom(roomCode))) {
		res.status(400).json({
			message: `Room ${roomCode} does not exist.`,
		});
		return;
	}

	// remove socketio mapping from redis if it exists
	let cookies = {};
	if (req.headers.cookie) {
		cookies = cookie.parse(req.headers.cookie);
	}
	const oldSessionId = cookies.sessionId;
	if (oldSessionId) {
		try {
			await redisClient.del(`socket_sessions:${oldSessionId}`);
		} catch (err) {
			console.error("Error deleting socketio mapping from redis: ", err);
		}
	}
	// clear the existing sessionId cookie
	res.clearCookie("sessionId");

	// add a new session
	const sessionId = await db_client.addSession(roomCode);

	// send all elements in room to user
	let roomElements;
	try {
		roomElements = await db_client.getAllElements(sessionId);
	} catch (error) {
		res.status(500).json({ message: `Error getting elements: ${error}` });
		return;
	}

	res.cookie("sessionId", sessionId, {
		httpOnly: true,
		sameSite: "none",
		secure: process.env.NODE_ENV === "production",
	});

	res.status(200).json({ elements: roomElements });
}
async function handleCreateRoom(req, res) {
	// create room
	let roomCode;
	try {
		roomCode = await db_client.addRoom();
	} catch (error) {
		res.status(500).json({ message: `Error creating room: ${error}` });
		return;
	}

	res.status(200).json({ roomCode: roomCode });
}

// send updates to all users in the room
io.on("connection", async (socket) => {
	let sessionId = "";
	if (socket.handshake.headers.cookie) {
		sessionId = cookie.parse(socket.handshake.headers.cookie).sessionId;
	}

	// error if no sessionId provided
	if (!sessionId) {
		io.emit("error", "No session id provided");
		socket.disconnect();
		return;
	}

	if (!(await db_client.checkSession(sessionId))) {
		io.emit("error", "Session with your Session-ID does not exist. ");
		socket.disconnect();
		return;
	}

	// Associate the socket.id with the sessionId in Redis
	redisClient.set(`socket_sessions:${sessionId}`, socket.id);

	socket.on("disconnect", () => {
		// Remove the association from Redis when the socket disconnects
		redisClient.del(`socket_sessions:${sessionId}`);
		db_client.removeSession(sessionId);
	});

	socket.on("update", async (update) => {
		const affected_sessionIds = await db_client.addOrUpdateElement(
			sessionId,
			update.element
		);
		// find all sockets associated with the affected sessionIds
		if (affected_sessionIds.length > 0) {
			redisClient.mget(
				affected_sessionIds.map(
					(sessionId) => `socket_sessions:${sessionId}`
				),
				(err, socketIds) => {
					if (err) {
						console.error(
							"Error getting socket IDs from Redis:",
							err
						);
						return;
					}
					// Emit the update to all sockets associated with the affected sessionIds
					socketIds.forEach((socketId) => {
						if (socketId) {
							socket.to(socketId).emit("update", update.element);
						}
					});
				}
			);
		}
	});
});
