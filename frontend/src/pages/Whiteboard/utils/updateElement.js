import { createElement } from ".";
import { toolTypes } from "../../../constants";
import { store } from "../../../store/store";
import { updateOrSetElements } from "../whiteboardSlice";

export const updateElement = ({ id, x1, x2, y1, y2, type }) => {
	// current element fetched directly from redux
	const elements = store.getState().whiteboard.elements;
	const index = elements.findIndex((element) => element.id === id);
	if (index === -1) return;
	let updatedElement;
	switch (type) {
		case toolTypes.LINE:
		case toolTypes.CIRCLE:
		case toolTypes.RECTANGLE:
			updatedElement = {
				...createElement({
					id,
					x1,
					y1,
					x2,
					y2,
					toolType: type,
					order: elements[index].order,
				}),
				revision: elements[index].revision + 1,
			};

			store.dispatch(
				updateOrSetElements({
					payload: updatedElement,
					myOwnChange: true,
				}),
			);
			break;
		case toolTypes.PENCIL:
		case toolTypes.ERASER:
			updatedElement = {
				...elements[index],
				points: [
					...elements[index].points,
					{
						x: x2,
						y: y2,
					},
				],
				revision: elements[index].revision + 1,
			};

			store.dispatch(
				updateOrSetElements({
					payload: updatedElement,
					myOwnChange: true,
				}),
			);
			break;
		case toolTypes.TEXT:
			break;
		default:
			throw new Error("Something went wrong when updating element");
	}
};
