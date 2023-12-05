import { v4 as uuidv4 } from "uuid";
import { generateSlug } from "random-word-slugs";
import { MongoClient } from "mongodb";

export default class DatabaseClient {
	constructor(url, dbName) {
		this.client = new MongoClient(url);
		this.dbName = this.dbName;
		this.db = null;
	}

	async connect() {
		try {
			await this.client.connect();
		} catch (error) {
			console.error(`Error connecting to MongoDB: ${error}`);
			throw error;
		}
		console.log("Connected to MongoDB");
		this.db = this.client.db(this.dbName);

		// Create indexes
		await this.db.collection("sessions").createIndex({ sessionId: 1 });
		await this.db.collection("rooms").createIndex({ roomCode: 1 });
		await this.db.collection("elements").createIndex({ sessionId: 1 });
	}

	async checkSession(sessionId) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const session = await this.db
				.collection("sessions")
				.findOne({ sessionId });
			return session !== null;
		} catch (error) {
			console.error(`Error checking session: ${error}`);
			throw error;
		}
	}

	async getRoomSessions(roomCode) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const room = await this.db
				.collection("rooms")
				.findOne({ roomCode });
			return room ? room.sessions : [];
		} catch (error) {
			console.error(`Error getting room sessions: ${error}`);
			throw error;
		}
	}

	async checkRoom(roomCode) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const room = await this.db
				.collection("rooms")
				.findOne({ roomCode });
			return room !== null;
		} catch (error) {
			console.error(`Error checking room: ${error}`);
			throw error;
		}
	}

	async addRoom() {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			let roomCode;
			let existingRoom;

			do {
				roomCode = generateSlug();
				existingRoom = await this.db
					.collection("rooms")
					.findOne({ roomCode });
			} while (existingRoom);

			await this.db.collection("rooms").insertOne({ roomCode });

			return roomCode;
		} catch (error) {
			console.error(`Error adding room: ${error}`);
			throw error;
		}
	}

	async removeRoom(roomCode) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			await this.db.collection("rooms").deleteOne({ roomCode });
			await this.db.collection("elements").deleteMany({ roomCode });
		} catch (error) {
			console.error(`Error removing room: ${error}`);
			throw error;
		}
	}

	async addSession(roomCode) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const sessionId = uuidv4();

			// Find the room document
			const room = await this.db
				.collection("rooms")
				.findOne({ roomCode });

			// Create a new session document in the sessions collection
			await this.db.collection("sessions").insertOne({
				sessionId,
				room: room._id,
			});

			return sessionId;
		} catch (error) {
			console.error(`Error adding session: ${error}`);
			throw error;
		}
	}

	async removeSession(sessionId) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}

			// Delete the session document from the sessions collection
			await this.db.collection("sessions").deleteOne({ sessionId });
		} catch (error) {
			console.error(`Error removing session: ${error}`);
			throw error;
		}
	}

	async getAllElements(sessionId) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}

			// Find the session document
			const session = await this.db
				.collection("sessions")
				.findOne({ sessionId });

			if (!session) {
				throw new Error(`Session with ID ${sessionId} not found`);
			}

			// Find the elements that reference the room
			const elements = await this.db
				.collection("elements")
				.find({ room: session.room })
				.toArray();

			return elements;
		} catch (error) {
			console.error(`Error getting room elements: ${error}`);
			throw error;
		}
	}

	async addOrUpdateElement(sessionId, element) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}

			// Find the session document
			const session = await this.db
				.collection("sessions")
				.findOne({ sessionId });

			if (!session) {
				throw new Error(`Session with ID ${sessionId} not found`);
			}

			// Check if the element already exists
			const existingElement = await this.db
				.collection("elements")
				.findOne({ id: element.id, room: session.room });

			if (existingElement) {
				// If the element exists, override it
				await this.db
					.collection("elements")
					.updateOne(
						{ id: element.id, room: session.room },
						{ $set: element }
					);
			} else {
				// If the element does not exist, add it
				await this.db
					.collection("elements")
					.insertOne({ ...element, room: session.room });
			}

			// Find all sessions in the same room
			const sessionsInRoom = await this.db
				.collection("sessions")
				.find({ room: session.room })
				.toArray();

			// Extract the sessionIds from the sessions
			const sessionIds = sessionsInRoom.map((s) => s.sessionId);

			return sessionIds; // return sessionIds of all users in room so we can send updates to them
		} catch (error) {
			console.error(`Error adding or updating element: ${error}`);
			throw error;
		}
	}
}
