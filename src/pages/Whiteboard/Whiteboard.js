import React, { useRef, useLayoutEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";
import rough from "roughjs";
import { actions, toolTypes } from "../../constants";
import { createElement, updateElement, drawElement } from "./utils";
import { v4 as uuid } from "uuid";
import { updateElement as updateElementInStore } from "./whiteboardSlice";

let selectedElement;

const setSelectedElement = (el) => {
	selectedElement = el;
};

const Whiteboard = () => {
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const room = query.get("room");

	const canvasRef = useRef();
	const toolType = useSelector((state) => state.whiteboard.tool);
	const elements = useSelector((state) => state.whiteboard.elements);

	const [action, setAction] = useState(null);

	const dispatch = useDispatch();

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const roughCanvas = rough.canvas(canvas);

		elements.forEach((element) => {
			drawElement({ roughCanvas, context: ctx, element });
		});
	}, [elements]);

	const handleMouseDown = (event) => {
		const { clientX, clientY } = event;
		console.log(toolType);

		if (toolType === toolTypes.RECTANGLE || toolType === toolTypes.LINE) {
			setAction(actions.DRAWING);

			const element = createElement({
				x1: clientX,
				y1: clientY,
				x2: clientX,
				y2: clientY,
				toolType,
				id: uuid(),
			});

			setSelectedElement(element);

			dispatch(updateElementInStore(element));
		}
	};

	const handleMouseUp = () => {
		setAction(null);
		setSelectedElement(null);
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
