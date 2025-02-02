import React, { useState, useRef } from "react";
import { RMap, ROSM, RLayerVector, RFeature, RStyle } from "rlayers";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

const MapWithDeletableFeatures = () => {
  const mapRef = useRef(null);

  const initialCircles = [
    { id: 1, coordinates: [-74.006, 40.7128], radius: 1000 }, // New York
    { id: 2, coordinates: [-87.6298, 41.8781], radius: 1000 }, // Chicago
    { id: 3, coordinates: [-118.2437, 34.0522], radius: 1000 }, // Los Angeles
  ];

  const [circles, setCircles] = useState(initialCircles);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    circle: null,
  });
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    circle: null,
  });

  // Handle right-click
  const handlePointerDown = (e, circle) => {
    const map = mapRef.current?.ol;
    if (!map) return;

    e.preventDefault();
    e.stopPropagation();

    const pixel = map.getPixelFromCoordinate(e.coordinate);

    console.log("Right click detected at:", { x: pixel[0], y: pixel[1] });

    setContextMenu({
      visible: true,
      x: pixel[0],
      y: pixel[1],
      circle,
    });
  };

  // Handle mouse enter/leave for hover effects
  const handleMouseEnter = (e, circle) => {
    const map = mapRef.current?.ol;
    if (!map) return;

    const pixel = map.getPixelFromCoordinate(e.coordinate);

    setTooltip({
      visible: true,
      x: pixel[0],
      y: pixel[1] - 30,
      circle,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      circle: null,
    });
  };

  // Delete circle
  const handleDelete = (e, circleId) => {
    e.stopPropagation();
    console.log("Deleting circle with ID:", circleId);

    setCircles((prevCircles) => {
      const newCircles = prevCircles.filter((circle) => circle.id !== circleId);
      console.log("Circles after deletion:", newCircles);
      return newCircles;
    });

    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      circle: null,
    });
  };

  // Close menus on map click
  const handleMapClick = (e) => {
    if (!e.target.closest("button")) {
      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
        circle: null,
      });
    }
  };

  // Prevent default context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      style={{ width: "100%", height: "100vh", position: "relative" }}
      onContextMenu={handleContextMenu}
    >
      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 10,
          background: "white",
          padding: "0.5rem",
          borderRadius: "4px",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          Right-click on any circle to delete it.
        </p>
      </div>
      // to remove the circe
      ==============================================================
      {/* Context Menu */}
      {contextMenu.visible && contextMenu.circle && (
        <div
          style={{
            position: "fixed",
            left: contextMenu.x + "px",
            top: contextMenu.y + "px",
            zIndex: 9999,
            backgroundColor: "white",
            borderRadius: "6px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            padding: "8px",
            minWidth: "120px",
            border: "1px solid #ddd",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              console.log(
                "Delete button clicked for circle:",
                contextMenu.circle.id
              );
              handleDelete(e, contextMenu.circle.id);
            }}
            style={{
              cursor: "pointer",
              background: "#ff4444",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#ff2222")}
            onMouseLeave={(e) => (e.target.style.background = "#ff4444")}
          >
            🗑️ Delete Circle
          </button>
        </div>
      )}
      //========================================================================
      {/* Hover Tooltip */}
      {tooltip.visible && !contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + "px",
            top: tooltip.y + "px",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.85rem",
            pointerEvents: "none",
          }}
        >
          Right-click to delete
        </div>
      )}
      {/* Map Container */}
      <div style={{ position: "absolute", inset: 0 }}>
        <RMap
          ref={mapRef}
          onClick={handleMapClick}
          initial={{ center: fromLonLat([-98.5795, 39.8283]), zoom: 4 }}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
        >
          <ROSM />
          <RLayerVector>
            {circles.map((circle) => (
              <RFeature
                key={circle.id}
                geometry={new Point(fromLonLat(circle.coordinates))}
                onClick={(e) => {
                  handlePointerDown(e, circle);
                }}
                onPointerEnter={(e) => handleMouseEnter(e, circle)}
                onPointerLeave={handleMouseLeave}
              >
                <RStyle.RStyle>
                  <RStyle.RCircle radius={circle.radius / 50}>
                    <RStyle.RFill
                      color={
                        tooltip.circle?.id === circle.id
                          ? "rgba(255,0,0,0.6)"
                          : "rgba(255,0,0,0.4)"
                      }
                    />
                    <RStyle.RStroke
                      color="red"
                      width={tooltip.circle?.id === circle.id ? 3 : 2}
                    />
                  </RStyle.RCircle>
                </RStyle.RStyle>
              </RFeature>
            ))}
          </RLayerVector>
        </RMap>
      </div>
    </div>
  );
};

export default MapWithDeletableFeatures;
