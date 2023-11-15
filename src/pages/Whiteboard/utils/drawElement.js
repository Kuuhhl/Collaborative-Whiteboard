import { toolTypes } from "../../../constants";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";
import { drawText } from "canvas-txt";

const drawTextElement = (context, element) => {
	drawText(context, element.text, {
		width: 999,
		height: 20,
		x: element.x1,
		y: element.y1,
		fontSize: 20,
		align: "left",
		font: "Arial",
		color: "black",
	});
};

const drawPencilELement = (context, element) => {
	const stroke = getStroke(element.points, {
		size: 4,
	});

	const pathData = getSvgPathFromStroke(stroke);

	const path = new Path2D(pathData);

	context.fill(path);
};

export const drawElement = ({ roughCanvas, context, element }) => {
	switch (element.type) {
		case toolTypes.LINE:
		case toolTypes.RECTANGLE:
			return roughCanvas.draw(element.roughElement);
		case toolTypes.PENCIL:
			drawPencilELement(context, element);
			break;
		case toolTypes.TEXT:
			drawTextElement(context, element);
			break;
		default:
			throw new Error("Something went wrong when drawing element");
	}
};
