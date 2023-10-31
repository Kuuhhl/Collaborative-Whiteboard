import { createElement } from ".";
import { toolTypes } from "../../constants";
import { store } from "../../store/store";
import { setElements } from "../whiteboardSlice";

export const updateElement = (
  { id, x1, x2, y1, y2, type, index },
  elements
) => {
  const elementsCopy = [...elements];

  switch (type) {
    case toolTypes.RECTANGLE:
      const updateElement = createElement({
        id,
        x1,
        y1,
        x2,
        y2,
        toolType: type,
      });

      elementsCopy[index] = updateElement;

      store.dispatch(setElements(elementsCopy));
      break;
    default:
      throw new Error("Something went wrong when updating element");
  }
};
