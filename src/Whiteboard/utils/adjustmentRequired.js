import { toolTypes } from "../../constants";

export const adjustmentRequired = (type) =>
  [toolTypes.RECTANGLE].includes(type);
