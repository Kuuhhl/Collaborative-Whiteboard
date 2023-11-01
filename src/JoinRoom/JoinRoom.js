import React, { useState } from "react";

const JoinRoom = () => {
	const [nickname, setNickname] = useState("");
	const [roomCode, setRoomCode] = useState("");

	return (
		<div className="flex flex-col items-center">
			<input
				type="text"
				placeholder="Enter a nickname"
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				className="w-64 p-2 mb-4 border"
			/>
			<input
				type="text"
				placeholder="Enter a room code"
				value={roomCode}
				onChange={(e) => setRoomCode(e.target.value)}
				className="w-64 p-2 mb-4 border"
			/>
			<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				Join Room
			</button>
			<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
				Create Room
			</button>
		</div>
	);
};

export default JoinRoom;
