import { toolTypes } from "../../../constants";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";

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
    default:
      throw new Error("Something went wrong when drawing element");
  }
};
