import express from "express";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import DatabaseClient from "./databaseClient.js";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerWhiteboardSockets } from "./whiteboardSockets.js";

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
const pubClient = new Redis({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASSWORD,
	tls: {},
});

console.log(
	`Connecting to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
);
pubClient.on("connect", () => {
	console.log("Connected to Redis");
});
pubClient.on("error", (err) => {
	console.error("Error connecting to Redis: ", err);
});
const subClient = pubClient.duplicate();
subClient.on("error", (err) => {
	console.error("Error connecting Redis subscriber: ", err);
});
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
		sameSite: "None",
		secure: true,
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

registerWhiteboardSockets(io, db_client);
