import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const JoinRoom = () => {
	const [roomCode, setRoomCode] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (roomCode) {
			navigate(`/?room=${roomCode}`);
		}
	};

	return (
		<div className="flex flex-col items-center min-h-screen bg-gray-100">
			<div className="m-auto p-8 bg-white rounded shadow-lg text-center">
				{/* Logo and Header */}
				<div className="mb-8">
					<img
						src="/icon.png"
						alt="Logo"
						className="w-24 h-24 mx-auto mb-4 rounded-md"
					/>
					<h1 className="text-3xl mb-4">Collaborative Whiteboard</h1>
				</div>

				{/* Inputs */}
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-4 items-center"
				>
					<input
						type="text"
						placeholder="Enter a room code"
						value={roomCode}
						onChange={(e) => setRoomCode(e.target.value)}
						className="w-64 p-2 border"
					/>
					<button
						type="submit"
						className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
							!roomCode && "opacity-50 cursor-not-allowed"
						}`}
						disabled={!roomCode}
					>
						Join Room
					</button>
					<Link
						to="/createRoom"
						className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
					>
						Create Room
					</Link>
				</form>
			</div>

			{/* Footer */}
			<div className="mt-auto mb-4">
				<a
					href="https://github.com/theXiaoWang/Collaborative-Whiteboard/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-500 hover:text-blue-700"
				>
					View on GitHub
				</a>
			</div>
		</div>
	);
};

export default JoinRoom;
