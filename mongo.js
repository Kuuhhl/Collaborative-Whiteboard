import mongodb from "mongodb";
import dotenv from "dotenv";

const MongoClient = mongodb.MongoClient;

// load environment variables
dotenv.config();

const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;

let db;

MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err, client) => {
		if (err) throw err;
		db = client.db("whiteboard-state");
	}
);

export const addElementToRoom = async (roomCode, uuid, value) => {
	const newElement = { uuid, value };
	const res = await db.collection(roomCode).insertOne(newElement);
	return res;
};

export const deleteElementByUUID = async (roomCode, uuid) => {
	const query = { uuid };
	const obj = await db.collection(roomCode).deleteOne(query);
	return `${obj.result.n} document(s) deleted`;
};

export const updateElementByUUID = async (roomCode, uuid, newValue) => {
	const query = { uuid };
	const newValues = { $set: { value: newValue } };
	const res = await db.collection(roomCode).updateOne(query, newValues);
	return "1 document updated";
};

export const getElementsInRoom = async (roomCode) => {
	const result = await db.collection(roomCode).find({}).toArray();
	return result;
};

export const getElementByUUID = async (roomCode, uuid) => {
	const query = { uuid };
	const result = await db.collection(roomCode).findOne(query);
	return result;
};

export const getRoomCodes = async () => {
	const collInfos = await db.listCollections().toArray();
	// Return only the names of the collections
	return collInfos.map((col) => col.name);
};
