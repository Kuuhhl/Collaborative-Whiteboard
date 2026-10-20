import { v4 as uuidv4 } from "uuid";
import { generateSlug } from "random-word-slugs";
import { MongoClient } from "mongodb";

export default class DatabaseClient {
	constructor(url, dbName) {
		this.client = new MongoClient(url);
		this.dbName = dbName;
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

		// enforce no duplicate element entries per room
		await this.db
			.collection("elements")
			.createIndex({ room: 1, id: 1 }, { unique: true });

		// auto-timeout sessions older than a day
		await this.db
			.collection("sessions")
			.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
	}

	async getSession(sessionId) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const session = await this.db
				.collection("sessions")
				.findOne({ sessionId });
			return session;
		} catch (error) {
			console.error(`Error checking session: ${error}`);
			throw error;
		}
	}

	async checkRoom(roomCode) {
		try {
			if (!this.db) {
				throw new Error("Database is not initialized");
			}
			const room = await this.db.collection("rooms").findOne({ roomCode });
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
				existingRoom = await this.db.collection("rooms").findOne({ roomCode });
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
			const room = await this.db.collection("rooms").findOne({ roomCode });

			// Create a new session document in the sessions collection
			await this.db.collection("sessions").insertOne({
				sessionId,
				room: room._id,
				createdAt: new Date(),
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

			const revision = element.revision ?? 1;

			// update if exists, insert if it doesn't ('upsert' combines these).
			// we filter by latest revision.
			await this.db
				.collection("elements")
				.updateOne(
					{ room: session.room, id: element.id, revision: { $lt: revision } },
					{ $set: { ...element, room: session.room, revision } },
					{ upsert: true },
				);
		} catch (error) {
			// 11000 is a duplicate-key error: an older revision was
			// rejected by the unique { room, id } index. Safe to ignore.
			if (error.code !== 11000) {
				console.error(`Error adding or updating element: ${error}`);
				throw error;
			}
		}
	}
}
