import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";

function ErrorOverlay({ message, buttonText, link, visible, setVisible }) {
	const navigate = useNavigate();

	const handleButtonClick = () => {
		setVisible(false);
	};

	useEffect(() => {
		const handleEnterPress = (event) => {
			if (event.key === "Enter") {
				if (link) {
					navigate(link);
				} else {
					handleButtonClick();
				}
			}
		};

		window.addEventListener("keydown", handleEnterPress);
		return () => {
			window.removeEventListener("keydown", handleEnterPress);
		};
	}, [link]);

	if (!visible) {
		return null;
	}
	return (
		<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 justify-center z-50 flex flex-col">
			<div className="m-auto p-8 bg-white rounded shadow-lg text-center flex flex-col items-center gap-4">
				<FontAwesomeIcon icon={faSadTear} size="3x" className="mb-4" />
				<h2 className="text-2xl mb-4">{message}</h2>
				{link ? (
					<Link
						to={link}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						{buttonText}
					</Link>
				) : (
					<button
						onClick={handleButtonClick}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						{buttonText}
					</button>
				)}
			</div>
		</div>
	);
}

ErrorOverlay.defaultProps = {
	message: "An error occurred",
	buttonText: "Okay",
};

export default ErrorOverlay;
