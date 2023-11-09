import cassandra from "cassandra-driver";

export const client = new cassandra.Client({
	contactPoints: ["localhost"],
	localDataCenter: "datacenter1",
	keyspace: "your_keyspace",
});

export const checkSession = async (sessionId) => {
	const query = "SELECT * FROM sessions WHERE sessionId = ?";
	const result = await client.execute(query, [sessionId], { prepare: true });
	return result.rowLength > 0;
};

export const addSession = async (sessionId, roomCode) => {
	const query = "INSERT INTO sessions (sessionId, roomCode) VALUES (?, ?)";
	await client.execute(query, [sessionId, roomCode], { prepare: true });
};

export const removeSession = async (sessionId) => {
	const query = "DELETE FROM sessions WHERE sessionId = ?";
	await client.execute(query, [sessionId], { prepare: true });
};

export const getRoomElements = async (roomCode) => {
	const query = "SELECT * FROM elements WHERE roomCode = ?";
	const result = await client.execute(query, [roomCode], { prepare: true });
	return result.rows;
};

export const addElementToRoom = async (roomCode, element) => {
	const query = "INSERT INTO elements (roomCode, element) VALUES (?, ?)";
	await client.execute(query, [roomCode, element], { prepare: true });
};

export const removeElementFromRoom = async (roomCode, element) => {
	const query = "DELETE FROM elements WHERE roomCode = ? AND element = ?";
	await client.execute(query, [roomCode, element], { prepare: true });
};
