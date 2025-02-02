// import React from "react";

// const DrawingManager: React.FC<{
//   onRouteClick: () => void;
//   onPolygonClick: () => void;
//   onCircleClick: () => void;
//   onPinToggle: () => void;
//   onLetteredActive: () => void;
// }> = ({
//   onRouteClick,
//   onPolygonClick,
//   onCircleClick,
//   onPinToggle,
//   onLetteredActive,
// }) => (
//   <div className="drawing-manager">
//     <button
//       onClick={onRouteClick}
//       className="drawing-manager-icon"
//       aria-label="Circle Shape"
//     >
//       <i className="bi bi-slash" />
//       <span className="hover-text">Route</span>
//     </button>

//     <button
//       onClick={onPolygonClick}
//       className="drawing-manager-icon"
//       aria-label="Polygon Shape"
//     >
//       <i className="bi bi-pentagon" />
//       <span className="hover-text">Polygon</span>
//     </button>

//     <button
//       onClick={onCircleClick}
//       className="drawing-manager-icon"
//       aria-label="Circle Shape"
//     >
//       <i className="bi bi-circle"></i>
//       <span className="hover-text">Circle</span>
//     </button>

//     <button
//       className="drawing-manager-icon"
//       aria-label="Pin Marker"
//       onClick={() => {
//         onPinToggle();
//         onLetteredActive();
//       }}
//     >
//       <i className="bi bi-binoculars" />
//       <span className="hover-text">Lettered</span>
//     </button>
//   </div>
// );

// export default DrawingManager;

//////////////////////////////////////////

import React, { useState } from "react";

const DrawingManager: React.FC<{
  onRouteClick: () => void;
  onPolygonClick: () => void;
  onCircleClick: () => void;
  onPinToggle: () => void;
  onLetteredActive: () => void;
}> = ({
  onRouteClick,
  onPolygonClick,
  onCircleClick,
  onPinToggle,
  onLetteredActive,
}) => {
  // State to track the active button
  const [activeButton, setActiveButton] = useState<string>("");

  // Function to handle button clicks and set the active button
  const handleButtonClick = (buttonName: string, callback: () => void) => {
    setActiveButton(buttonName);
    callback();
  };

  return (
    <div className="drawing-manager">
      <button
        onClick={() => handleButtonClick("Route", onRouteClick)}
        className={`drawing-manager-icon ${
          activeButton === "Route" ? "active" : ""
        }`}
        aria-label="Route Shape"
      >
        <i className="bi bi-slash" />
        <span className="hover-text">Route</span>
      </button>

      <button
        onClick={() => handleButtonClick("Polygon", onPolygonClick)}
        className={`drawing-manager-icon ${
          activeButton === "Polygon" ? "active" : ""
        }`}
        aria-label="Polygon Shape"
      >
        <i className="bi bi-pentagon" />
        <span className="hover-text">Polygon</span>
      </button>

      <button
        onClick={() => handleButtonClick("Circle", onCircleClick)}
        className={`drawing-manager-icon ${
          activeButton === "Circle" ? "active" : ""
        }`}
        aria-label="Circle Shape"
      >
        <i className="bi bi-circle"></i>
        <span className="hover-text">Circle</span>
      </button>

      <button
        onClick={() => {
          onPinToggle();
          onLetteredActive();
          handleButtonClick("Lettered", () => {}); // No callback needed here
        }}
        className={`drawing-manager-icon ${
          activeButton === "Lettered" ? "active" : ""
        }`}
        aria-label="Pin Marker"
      >
        <i className="bi bi-binoculars" />
        <span className="hover-text">Lettered</span>
      </button>
    </div>
  );
};

export default DrawingManager;
