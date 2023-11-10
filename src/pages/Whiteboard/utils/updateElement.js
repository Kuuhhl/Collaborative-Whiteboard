import { createElement } from ".";
import { toolTypes } from "../../../constants";
import { store } from "../../../store/store";
import { setElements } from "../whiteboardSlice";

export const updateElement = (
	{ id, x1, x2, y1, y2, type, index, points },
	elements
) => {
	const elementsCopy = [...elements];

	let updatedElement;
	switch (type) {
		case toolTypes.LINE:
		case toolTypes.RECTANGLE:
			updatedElement = createElement({
				id,
				x1,
				y1,
				x2,
				y2,
				toolType: type,
			});
			break;
		case toolTypes.PENCIL:
			updatedElement = createElement({
				id,
				points: points,
				toolType: type,
			});
			break;
		default:
			throw new Error("Something went wrong when updating element");
	}
	elementsCopy[index] = updatedElement;

	store.dispatch(setElements(elementsCopy));
};
