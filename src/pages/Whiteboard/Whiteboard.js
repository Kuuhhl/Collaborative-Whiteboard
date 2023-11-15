import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";
import rough from "roughjs";
import { actions, toolTypes } from "../../constants";
import { createElement, updateElement, drawElement } from "./utils";
import { v4 as uuid } from "uuid";
import {
	setElements,
	updateElement as updateElementInStore,
} from "./whiteboardSlice";
import ErrorOverlay from "../../components/ErrorOverlay";

let selectedElement;

const setSelectedElement = (el) => {
	selectedElement = el;
};

const Whiteboard = () => {
	const [error, setError] = useState({ visible: false, message: "" });

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
			try {
				const response = await fetch(
					"http://localhost:39291/joinRoom",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ roomId: room }),
					}
				);
				if (!response.ok) {
					throw new Error(await response.text());
				}
				const data = await response.json();

				// set sessid cookie
				Cookies.set("SESSID", data.sessid);

				// get room elements from server
				setElements(data.elements);
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
	}, [room]); // rerender canvas when elements change

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const roughCanvas = rough.canvas(canvas);

		elements.forEach((element) => {
			drawElement({ roughCanvas, context: ctx, element });
		});
	}, [elements]);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (
				action === actions.TYPING &&
				selectedElement &&
				selectedElement.type === toolTypes.TEXT
			) {
				let updatedText;
				if (event.key === "Enter") {
					setAction(null);
				} else if (event.key === "Backspace") {
					updatedText = selectedElement.text.slice(0, -1);
				} else {
					updatedText = (selectedElement.text || "") + event.key;
				}

				const updatedElement = {
					...selectedElement,
					text: updatedText,
				};
				setSelectedElement(updatedElement);
				dispatch(updateElementInStore(updatedElement));
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [action, dispatch]);

	// Mouse / Touchscreen handlers
	const handleMouseDown = (event) => {
		const { clientX, clientY } = event;

		let element;

		if (
			toolType === toolTypes.RECTANGLE ||
			toolType === toolTypes.LINE ||
			toolType === toolTypes.PENCIL
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
			dispatch(updateElementInStore(element));
		} else if (toolType === toolTypes.TEXT) {
			setAction(actions.TYPING);

			element = createElement({
				x1: clientX,
				y1: clientY,
				toolType,
				id: uuid(),
			});

			setSelectedElement(element);
			dispatch(updateElementInStore(element));
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
			<Menu />
			<div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-4">
				{room && `Room: ${room}`}
			</div>
			<canvas
				className="touch-none"
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
