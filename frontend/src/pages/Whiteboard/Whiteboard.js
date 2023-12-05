import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";
import rough from "roughjs";
import { actions, toolTypes } from "../../constants";
import { createElement, updateElement, drawElement } from "./utils";
import { v4 as uuid } from "uuid";
import {
	setOfflineMode,
	updateOrSetElements,
	clearElements,
} from "./whiteboardSlice";
import { connectToServer, listenToUpdateMessage } from "./utils/socket";
import ErrorOverlay from "../../components/ErrorOverlay";

let selectedElement;

const setSelectedElement = (el) => {
	selectedElement = el;
};

const Whiteboard = () => {
	const navigate = useNavigate();
	const [error, setError] = useState({ visible: false, message: "" });
	const [cursor, setCursor] = useState(null);

	// get room code
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const room = query.get("room");

	const canvasRef = useRef();
	const toolType = useSelector((state) => state.whiteboard.tool);
	const elements = useSelector((state) => state.whiteboard.elements);

	const [action, setAction] = useState(null);

	const dispatch = useDispatch();

	useEffect(() => {
		const joinRoom = async () => {
			// offline
			if (room.trim() === "offline") {
				dispatch(setOfflineMode(true));

				// get elements from local storage
				const elements = JSON.parse(localStorage.getItem("elements"));
				if (elements && elements !== "") {
					dispatch(
						updateOrSetElements({ elements, myOwnChange: false })
					);
				}
				return;
			}

			// online
			try {
				const response = await fetch(
					(process.env.BACKEND_BASE_URL || "http://localhost:39291") +
						"/joinRoom",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ roomCode: room }),
						credentials: "include",
					}
				);
				if (!response.ok) {
					// redirect to home page, with
					// error message in query params
					const data = await response.json();
					navigate(`/?error=${data.message}`);
				}
				const data = await response.json();

				// get room elements from server
				dispatch(
					updateOrSetElements({
						payload: data.elements,
						myOwnChange: false,
					})
				);

				// Connect to socketio
				connectToServer();

				// add socketio listener
				listenToUpdateMessage();
			} catch (e) {
				if (e.name === "TypeError") {
					setError({
						visible: true,
						message: "Could not join Room due to a network error.",
					});
				} else {
					setError({
						visible: true,
						message: e.message,
					});
				}
			}
		};

		joinRoom();
	}, [room, dispatch, navigate]); // rerender canvas when elements change

	useEffect(() => {
		// check if div element for custom cursor already exists
		if (document.getElementById("custom-cursor")) return;

		// Create a div element for the custom cursor
		const cursor = document.createElement("div");
		cursor.id = "custom-cursor";
		cursor.style.position = "absolute";
		cursor.style.borderRadius = "50%"; // Make the cursor round
		cursor.style.pointerEvents = "none"; // Make sure the cursor doesn't interfere with mouse events
		cursor.style.transform = "translate(-50%, -50%)";
		document.body.appendChild(cursor);

		// Save the cursor div in the state so it can be accessed in other functions
		setCursor(cursor);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!cursor || !canvas) return;

		if (!toolType) {
			cursor.style.display = "none";
			canvas.style.cursor = "default"; // Show the default cursor
		} else if (toolType === toolTypes.PENCIL) {
			cursor.style.display = "block";
			cursor.style.width = "5px";
			cursor.style.height = "5px";
			cursor.style.border = "1px solid black";
			canvas.style.cursor = "none"; // Hide the default cursor
		} else if (toolType === toolTypes.ERASER) {
			cursor.style.display = "block";
			cursor.style.width = "40px";
			cursor.style.height = "40px";
			cursor.style.backgroundColor = "white";
			cursor.style.border = "1px solid black";
			canvas.style.cursor = "none"; // Hide the default cursor
		} else if (toolType === toolTypes.TEXT) {
			cursor.style.display = "none";
			canvas.style.cursor = "text"; // Show the text cursor
		} else if (
			toolType === toolTypes.LINE ||
			toolType === toolTypes.CIRCLE ||
			toolType === toolTypes.RECTANGLE
		) {
			cursor.style.display = "none";
			canvas.style.cursor = "crosshair"; // Show the crosshair cursor
		}
	}, [toolType, cursor]);

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const roughCanvas = rough.canvas(canvas);

		elements.forEach((element) => {
			drawElement({ roughCanvas, context: ctx, element });
		});
	}, [elements]);

	// Mouse / Touchscreen handlers
	const handleMouseDown = (event) => {
		const { clientX, clientY } = event;

		let element;

		if (
			toolType === toolTypes.RECTANGLE ||
			toolType === toolTypes.CIRCLE ||
			toolType === toolTypes.LINE ||
			toolType === toolTypes.PENCIL ||
			toolType === toolTypes.ERASER
		) {
			setAction(actions.DRAWING);

			element = createElement({
				x1: clientX,
				y1: clientY,
				x2: clientX,
				y2: clientY,
				toolType,
				id: uuid(),
			});

			setSelectedElement(element);
			dispatch(
				updateOrSetElements({ payload: element, myOwnChange: true })
			);
		} else if (toolType === toolTypes.TEXT) {
			const input = document.createElement("input");
			input.style.position = "absolute";
			input.style.left = `${clientX}px`;
			input.style.top = `${clientY}px`;
			input.style.opacity = 1;

			const submitInput = () => {
				element = createElement({
					x1: clientX,
					y1: clientY,
					toolType,
					id: uuid(),
					text: input.value,
				});
				setSelectedElement(element);

				dispatch(
					updateOrSetElements({ payload: element, myOwnChange: true })
				);
				document.body.removeChild(input);
				document.removeEventListener("mousedown", handleOutsideClick);
			};

			const cancelInput = () => {
				document.body.removeChild(input);
				document.removeEventListener("mousedown", handleOutsideClick);
			};

			input.onkeydown = (event) => {
				if (event.key === "Enter") {
					submitInput();
				} else if (event.key === "Escape") {
					cancelInput();
				}
			};

			const handleOutsideClick = (event) => {
				if (event.target !== input && input.text) {
					submitInput();
				}
			};
			document.addEventListener("mousedown", handleOutsideClick);

			input.onblur = submitInput;
			document.body.appendChild(input);

			setTimeout(() => input.focus(), 0);
		}
	};

	const handleMouseUp = () => {
		if (action === actions.DRAWING) {
			setAction(null);
			setSelectedElement(null);
		}
	};

	const handleMouseMove = (event) => {
		const { clientX, clientY } = event;

		// Update the position of the custom cursor
		if (cursor) {
			cursor.style.left = `${clientX}px`;
			cursor.style.top = `${clientY}px`;
		}

		if (action === actions.DRAWING) {
			// find index of selected element
			const index = elements.findIndex(
				(el) => el.id === selectedElement.id
			);

			if (index !== -1) {
				updateElement(
					{
						index,
						id: elements[index].id,
						x1: elements[index].x1,
						y1: elements[index].y1,
						x2: clientX,
						y2: clientY,
						type: elements[index].type,
					},
					elements
				);
			}
		}
	};

	const handleTouchStart = (event) => {
		const { clientX, clientY } = event.touches[0];
		handleMouseDown({ clientX, clientY });
	};

	const handleTouchEnd = (event) => {
		handleMouseUp();
	};

	const handleTouchMove = (event) => {
		const { clientX, clientY } = event.touches[0];
		handleMouseMove({ clientX, clientY });
	};

	if (error.visible) {
		// disable error for now
		setError({ visible: false, message: error.message });
		return (
			<ErrorOverlay
				message={error.message}
				visible={error.visible}
				setVisible={() =>
					setError({
						visible: true,
						error: error.message,
					})
				}
				// link={"/"}
				buttonText="Go Back"
			/>
		);
	}

	return (
		<div className="relative">
			<Menu setAction={setAction} />
			<div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-4">
				{room === "offline" ? (
					<div className="flex flex-col items-center">
						<span
							className="italic mb-2"
							title="You are in offline mode because the backend server didn't give a response."
						>
							Offline Mode
						</span>
						{elements.length > 0 ? (
							<button
								onClick={() => {
									localStorage.removeItem("elements");
									dispatch(clearElements([]));
								}}
								className="underline text-blue-500 px-1 py-0.5"
							>
								Clear Local Canvas
							</button>
						) : (
							""
						)}
					</div>
				) : (
					`Room: ${room}`
				)}
			</div>
			{elements.length > 0 && (
				<button
					onClick={() => {
						const canvas =
							document.getElementById("whiteboard-canvas");
						const tempCanvas = document.createElement("canvas");
						tempCanvas.width = canvas.width;
						tempCanvas.height = canvas.height;
						const ctx = tempCanvas.getContext("2d");

						// Draw a white background
						ctx.fillStyle = "white";
						ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

						// Draw the original canvas on top
						ctx.drawImage(canvas, 0, 0);

						const imgData = tempCanvas.toDataURL("image/png");
						const link = document.createElement("a");
						link.href = imgData;
						link.download = "whiteboard.png";
						link.click();
					}}
					className="absolute bottom-0 right-0 m-4  bg-purple-800 px-4 py-2 text-white rounded"
				>
					<FontAwesomeIcon icon={faSave} />
				</button>
			)}
			<canvas
				className="touch-none cursor-none"
				id={"whiteboard-canvas"}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseMove={handleMouseMove}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				ref={canvasRef}
				width={window.innerWidth}
				height={window.innerHeight}
			/>
		</div>
	);
};
export default Whiteboard;
