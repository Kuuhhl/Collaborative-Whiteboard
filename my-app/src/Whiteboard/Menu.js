import React from "react";
import rectangleIcon from "../resources/icons/rectangle.svg";
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
        selectedToolType === type ? "menu_button_active" : "menu_button"
      }
    >
      <img width="80%" height="80%" src={src} />
    </button>
  );
};

const Menu = () => {
  return (
    <div className="menu_container">
      <IconButton src={rectangleIcon} type={toolTypes.RECTANGLE} />
    </div>
  );
};

export default Menu;
