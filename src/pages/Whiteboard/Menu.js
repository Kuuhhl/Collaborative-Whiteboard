import React from "react";
import { toolTypes } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { setToolType } from "./whiteboardSlice";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
	faEraser,
	faPencil,
	faFont,
	faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IconButton = ({ icon, type }) => {
	const dispatch = useDispatch();

	const selectedToolType = useSelector((state) => state.whiteboard.tool);

	const handleToolChange = () => {
		dispatch(setToolType(type));
	};

	return (
		<button
			onClick={handleToolChange}
			className={
				"w-10 h-10 rounded-lg border-none transition duration-300 " +
				(selectedToolType === type
					? "bg-red-200 hover:bg-red-300"
					: "bg-green-200 hover:bg-green-300")
			}
		>
			<FontAwesomeIcon icon={icon} />
		</button>
	);
};

const Menu = ({ setAction }) => {
	const handleMouseUp = () => {
		setAction(null);
	};
	return (
		<div
			className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 bg-gray-200 rounded-b-lg h-16 flex justify-around items-center"
			onMouseUp={handleMouseUp}
		>
			<IconButton icon={faSquare} type={toolTypes.RECTANGLE} />
			<IconButton icon={faMinus} type={toolTypes.LINE} />
			<IconButton icon={faPencil} type={toolTypes.PENCIL} />
			<IconButton icon={faFont} type={toolTypes.TEXT} />
			<IconButton icon={faEraser} type={toolTypes.ERASER} />
		</div>
	);
};
export default Menu;
