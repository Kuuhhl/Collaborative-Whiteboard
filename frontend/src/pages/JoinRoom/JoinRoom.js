import React, { useEffect, useState } from "react";
import ErrorOverlay from "../../components/ErrorOverlay";
import { useNavigate, useSearchParams } from "react-router-dom";

const JoinRoom = () => {
	const [searchParams] = useSearchParams();
	const [roomCode, setRoomCode] = useState("");
	const [error, setError] = useState({ visible: false, message: "" });
	const navigate = useNavigate();

	useEffect(() => {
		fetch(window.BACKEND_BASE_URL + "/ping")
			.then((response) => {
				if (!response.ok) {
					throw new Error("Server is down");
				}
			})
			.catch((error) => {
				navigate(`/?room=offline`);
			});
	}, [navigate]);

	useEffect(() => {
		if (searchParams.get("error")) {
			setError({
				visible: true,
				message: searchParams.get("error"),
			});
		}
	}, [searchParams]);

	const handleSubmitJoin = (e) => {
		e.preventDefault();
		if (roomCode) {
			// go to the new room
			navigate(`/?room=${roomCode}`);
		}
	};

	const handleSubmitCreate = async (event) => {
		event.preventDefault();

		try {
			const response = await fetch(
				window.BACKEND_BASE_URL + "/createRoom",
				{
					method: "POST",
				}
			);
			if (!response.ok) {
				throw new Error(await response.text());
			}
			const data = await response.json();

			// go to the newly created room
			navigate(`/?room=${data.roomCode}`);
		} catch (e) {
			if (e.name === "TypeError") {
				setError({
					visible: true,
					message: "Could not create Room due to a network error.",
				});
			} else {
				setError({
					visible: true,
					message: e.message,
				});
			}
		}
	};

	return (
		<div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
			<div className="m-auto p-8 bg-white bg-opacity-70 backdrop-filter backdrop-blur-md rounded shadow-lg text-center">
				{error.visible && (
					<ErrorOverlay
						message={error.message}
						visible={error.visible}
						setVisible={() =>
							setError({
								visible: false,
								error: error.message,
							})
						}
					/>
				)}
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
				<div className="flex flex-col gap-4">
					<form
						onSubmit={handleSubmitJoin}
						className="flex flex-col gap-4 items-center"
					>
						<input
							type="text"
							autoFocus
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
					</form>
					<form
						onSubmit={handleSubmitCreate}
						className="flex flex-col gap-4 items-center"
					>
						<button
							className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
							onClick={handleSubmitCreate}
						>
							Create new Room
						</button>
					</form>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-auto mb-4">
				<a
					href="https://github.com/theXiaoWang/Collaborative-Whiteboard/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-white hover:translate-y-1 transition-all duration-200"
				>
					View on GitHub
				</a>
			</div>
		</div>
	);
};

export default JoinRoom;
