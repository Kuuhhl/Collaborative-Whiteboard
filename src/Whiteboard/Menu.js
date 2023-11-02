import React from "react";
import rectangleIcon from "../resources/icons/rectangle.svg";
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import textIcon from "../resources/icons/text.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import { toolTypes } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setToolType } from "./whiteboardSlice";

const IconButton = ({ src, type }) => {
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
			<img alt={type + " tool icon"} src={src} />
		</button>
	);
};

const Menu = () => {
	return (
		<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 bg-gray-200 rounded-b-lg h-16 flex justify-around items-center">
			<IconButton src={rectangleIcon} type={toolTypes.RECTANGLE} />
			<IconButton src={lineIcon} type={toolTypes.LINE} />
			<IconButton src={pencilIcon} type={toolTypes.PENCIL} />
			<IconButton src={textIcon} type={toolTypes.TEXT} />
			<IconButton src={rubberIcon} type={toolTypes.RUBBER} />
		</div>
	);
};
export default Menu;
