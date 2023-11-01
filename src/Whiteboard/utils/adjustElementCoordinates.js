import { toolTypes } from "../../constants";

export const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;

  if (type === toolTypes.RECTANGLE) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const minY = Math.min(y1, y2);

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  }
};
