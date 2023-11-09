import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Whiteboard from "./pages/Whiteboard/Whiteboard";
import JoinRoom from "./pages/JoinRoom/JoinRoom";

function App() {
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const room = query.get("room");

	return (
		<Routes>
			<Route
				path="/"
				element={room ? <Whiteboard room={room} /> : <JoinRoom />}
			/>
		</Routes>
	);
}

export default App;
