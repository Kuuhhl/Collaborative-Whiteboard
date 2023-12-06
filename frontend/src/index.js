import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

// This is a hack to get the backend base url from the environment variables
if (
	process.env.REACT_APP_BACKEND_BASE_URL &&
	window.BACKEND_BASE_URL === "BACKEND_BASE_URL"
) {
	window.BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
}

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<Router>
				<App />
			</Router>
		</Provider>
	</React.StrictMode>
);

reportWebVitals();
