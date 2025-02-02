import React, { useState, useMemo, useEffect, useRef } from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Circle as OLCircle, LineString, Polygon } from "ol/geom";
import Modal from 'react-modal'; 
import {
  RInteraction,
  RLayerVector,
  RLayerVectorTile,
  RMap,
  RStyle,
  RFeature,
  ROverlay,
  RPopup,
} from "rlayers";
import "ol/ol.css";
import { altShiftKeysOnly, shiftKeyOnly } from "ol/events/condition";
import { bearing, distance,} from "@turf/turf";
import { MVT } from "ol/format";
import { Fill, Stroke, Style } from "ol/style"; 
import * as uuid from 'uuid';
import Plus from "../../public/assests/plus.png";
import CircleForm from "./CicleForm";
import ShapeSelectForm from "./ShapeSelectForm"; 
import DrawingManager from "./DrawingManager";
import { deleteRoute, deleteShape } from "../apis/shape";
import Swal from "sweetalert2";


const center = fromLonLat([72.36, 18.65]);
let format = new MVT();


interface MapComProps {
  setCordinate: (coordinates: any) => void;
  setForm: (status: boolean) => void;
  setRootForm: (status: boolean) => void;
  setCircleForm: (status: boolean) => void;
  setLetteredForm: (status: boolean) => void;
  dFeature: boolean;
}

interface Location {
  lat: number;
  lng: number;
}

interface Data {
  location: Location;
  bearing: number;
  range: number;
  time: string;
}

interface WebSocketData {
  unit_name: string;
  latitude: number;
  longitude: number;
}




const MapCom: React.FC<MapComProps> = ({
  setCordinate,
  setForm,
  setRootForm,
  setCircleForm,
  setLetteredForm,
  dummyData, 
  setDummyData,
  dFeature,
  selectedFeature,
  setSelectedFeature
}) => {
  const layerRef = useRef<any>(null);
  const newRef = useRef<any>(null);

  const [visible, setVisible] = useState<boolean>(false);
  const [loc, setLoc] = useState<[number, number] | null>(null);
  const [type, setType] = useState<"Polygon" | "Circle" | "Route" | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const [data, setData] = useState<Data>({
    location: { lat: 0, lng: 0 },
    bearing: 0,
    range: 0,
    time: new Date().toLocaleDateString(),
  });
  const [isDataChanging, setIsDataChanging] = useState<boolean>(false);

  const [selectedShape, setSelectedShape] = useState<unknown>(null);


  const handleSelectedShape = (shapeId) => {
    const shapeData = dummyData.find((data)=>data.shapeId == shapeId)
    setSelectedShape(shapeData)
  }

  useEffect(()=>{
console.log(selectedShape);
  }, [selectedShape])

  const [showForm, setShowForm] = useState<boolean>(false);
  const [shape, setShape] = useState<any>([]);
 
  const [markers, setMarkers] = useState<any>([]);

  const [circleData, setCircleData] = useState<any>(null); // State
  // for storing circle data (latitude, longitude, radius)

  // New state to track whether a shape has been drawn
  const [isShapeSelected, setIsShapeSelected] = useState<boolean>(false); // New state to track if a shape is selected

  const [showMarker, setShowMarker] = useState<boolean>(false); //
  // State to track marker visibility

  const [features, setFeatures] = useState<any[]>([]); // To store
  // drawn features
  const [dFeatures, setDFeatures] = useState<any>(null);
  // To track the selected feature

  const [firstClickLocation, setFirstClickLocation] = useState<
    [number, number] | null
  >(null);
  const [isLetteredActive, setIsLetteredActive] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state

  const onDrawStart = () => {
    setIsDrawing(true); // Set drawing state to true
  };

  useEffect(() => {
    console.log(shape);
    console.log(JSON.stringify(features) + "ffffffhtffhdhd");
  }, [shape, features]);

  const styles = useMemo(() => {
    return new Style({
      fill: new Fill({
        color: "rgba(245,232,39,0.8)",
      }),
      stroke: new Stroke({ color: "#000000", width: 0.5 }),
    });
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.0.200:5015");

    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({ type: "targets" }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // console.log("message received", message);
      setMarkers((prevUnits: any) => {
        // Check if the target_id already exists
        const existingUnitIndex = prevUnits.findIndex(
          (item: any) => item.target_id === message.target_id
        );

        if (existingUnitIndex !== -1) {
          // If the unit exists, replace it
          const updatedUnits = [...prevUnits];
          updatedUnits[existingUnitIndex] = message; // Replace the
          // unit at the found index
          return updatedUnits;
        } else {
          // If it doesn't exist, add it to the array
          return [...prevUnits, message];
        }
      });
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    // console.log("markers", markers);
  }, [markers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({ ...prev, time: new Date().toLocaleTimeString() }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onRouteClick = () => {
    setType("Route");
    setVisible(true);
    setIsShapeSelected(true);
  };

  const onPolyonClick = () => {
    setType("Polygon");
    setVisible(true);
    setIsShapeSelected(true);
  };

  const onCircleClick = () => {
    setType("Circle");
    setVisible(true);
    setIsShapeSelected(true);
  };



  const onDrawEnd = async (event: any) => {
    setSelectedFeature(null);
    setIsDrawing(false); // Reset drawing state  
    const geojson = new GeoJSON();
    const feature = event.feature;
    console.log(feature);
  
    // Convert the feature to GeoJSON
    let geoJson = geojson.writeFeatureObject(feature);
    console.log("geoJson", geoJson);
  
    // Update state with the new feature
    setDFeatures(geoJson);
    // setFeatures((prevFeatures) => [...prevFeatures, feature]);
    setFeatures([]);

  
    // Extract and set coordinates based on the geometry type
    const geometry = feature.getGeometry();
  
    if (geometry instanceof Polygon) {
      // Handle Polygon
      const coordinates = geometry.getCoordinates(); // Get coordinates of the polygon
      console.log("Polygon Coordinates:", coordinates);
  
      // Format the coordinates into the required GeoJSON structure
      const featureObject = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coordinates, // Coordinates are already in the correct format
        },
        properties: null, // Add properties if needed
      };
  
      setCordinate(featureObject); // Save the feature object
      setForm(true); // Show the form for Polygon
    } else if (geometry instanceof LineString) {
      // Handle Route (LineString)
      const coordinates = geometry.getCoordinates(); // Get coordinates of the route
      console.log("Route Coordinates:", coordinates);
  
      // Format the coordinates into the required GeoJSON structure
      const featureObject = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates, // Coordinates are already in the correct format
        },
        properties: null, // Add properties if needed
      };
  
      setCordinate(featureObject); // Save the feature object
      setRootForm(true); // Show the form for Route
    } else if (geometry instanceof OLCircle) {
      // Handle Circle
      const center = geometry.getCenter(); // Get center of the circle
      const radius = geometry.getRadius(); // Get the radius of the circle
  
      // Convert center from projected coordinates to geographic (longitude, latitude)
      const [longitude, latitude] = toLonLat(center);
      console.log(
        `Circle drawn at Lat: ${latitude}, Lng: ${longitude}, Radius: ${radius}`
      );
  
      const featureObject = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
          radius: radius, 
        },
        properties: null,
      };
  
      setCordinate(featureObject); // Save the feature object
      setCircleForm(true); // Show the form for Circle
    } else {
      console.error("Unsupported geometry type:", geometry);
    }
    setVisible(false);

  }


  const onPointerMove = (e: any) => {
    const { map } = e;
    const [mapLng, mapLat] = map.getCoordinateFromPixel(e.pixel);

    // Convert to WGS84 coordinates
    const [longitude, latitude] = toLonLat([mapLng, mapLat]);

    // Update state with converted coordinates
    if (isDrawing && longitude && latitude) {
      setData((prev) => ({
        ...prev,
        location: { lat: latitude, lng: longitude },
        range: loc
          ? distance([longitude, latitude], loc, {
              units: "nauticalmiles",
            })
          : 0,
        // bearing: loc ? (bearing([longitude, latitude], loc) + 180) % 360 : 0,
        bearing: loc ? bearing([longitude, latitude], loc) : 0,
      }));

      if (!loc) {
        setLoc([longitude, latitude]);
      }
    } else {
      setData((prev) => ({
        ...prev,
        location: { lat: latitude, lng: longitude },
        range: loc
          ? distance([longitude, latitude], loc, { units: "nauticalmiles" })
          : 0,
        bearing: loc ? bearing([longitude, latitude], loc) : 0,
      }));
    }
  };

  const onMapClick = (e: any) => {
    if (!showMarker) return;

    if (firstClickLocation) return;

    if (isLetteredActive) {
      const { map } = e;
      const clickedCoords = map.getCoordinateFromPixel(e.pixel);
      const [longitude, latitude] = toLonLat(clickedCoords);
      console.log(longitude, latitude);
      setSelectedCoordinates({
        latitude: latitude.toFixed(2),
        longitude: longitude.toFixed(2),
      });

      setCordinate({
        latitude: latitude.toFixed(2),
        longitude: longitude.toFixed(2),
      });

      setShowLetteredForm(true);

      setIsLetteredActive(false);
    }

    const { map } = e;
    const clickedCoords = map.getCoordinateFromPixel(e.pixel);
    const [longitude, latitude] = toLonLat(clickedCoords);

    setSelectedCoordinates({
      latitude: latitude.toFixed(2),
      longitude: longitude.toFixed(2),
    });

    setLetteredForm(true);

    setPinLocation([longitude, latitude]);
    setFirstClickLocation([longitude, latitude]);

    setMarkers([
      {
        target_id: Date.now(),
        latitude,
        longitude,
        type: "location",
        unit_name: "location",
      },
    ]);

    if (loc) {
      const newRange = distance([longitude, latitude], loc, {
        units: "nauticalmiles",
      });
      const newBearing = bearing([longitude, latitude], loc);

      setData((prev) => ({
        ...prev,
        location: { lat: latitude, lng: longitude }, 
        range: newRange, 
        bearing: newBearing, 
      }));
    } else {
      setLoc([longitude, latitude]);
    }
  };

  const handleShowForm = () => {
    setShowForm(true); // Open the form modal
  };

  const handleCloseForm = () => {
    setShowForm(false); // Close the form modal
    console.log("logged");
    setVisible(false);
  };

  const handleFormSubmit = (shapeType: string, name: string) => {
    console.log("Shape Type: ", shapeType);
    console.log("Name: ", name);
  };

  const aircraftH = 48,
    aircraftW = 48,
    submarineH = 48,
    submarineW = 28;

  useEffect(() => {
    console.log("dFeatures", dFeatures);
  }, [dFeatures]);




    const handleFeatureClick = (feature) => {
      console.log(feature)
      setSelectedFeature(feature);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      // setSelectedFeature(null); 
    };

    const handleEditForm = (shapeType) => {
      console.log(shapeType);
      if(shapeType.toLowerCase() === 'polygon'){
       setForm(true);
      }else if (shapeType.toLowerCase() === 'circle') {
       setCircleForm(true);
      }else if(shapeType.toLowerCase() === 'linestring') {
       setRootForm(true);
      }
     }
  
    const handleEdit = () => {
      console.log(selectedShape)
      handleEditForm(selectedFeature?.type)
      closeModal();
    };
  
    // Handle Hide action
    const handleHide = () => {
      const updatedData = dummyData.filter((data) => data.shapeId !== selectedFeature.shapeId);
      setDummyData(updatedData);
      closeModal();
    };
  
    // Handle Delete action
    const handleDelete = () => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          if (selectedFeature?.type?.toLowerCase() === "linestring") {
            deleteRoute(selectedFeature?.id, () => {});
          } else {
            deleteShape(selectedFeature?.id, () => {});
          }
          Swal.fire(
            'Deleted!',
            'Your item has been deleted.',
            'success'
          );
        }
      }).finally(()=>{
        closeModal();
      });
    };



  return (
    <>
      <RMap
        width={"100%"}
        height={"100vh"}
        className="r-map"
        onPointerMove={onPointerMove}
        onClick={onMapClick}
        initial={{ center: center, zoom: 5 }}
      >
        <DrawingManager
          onRouteClick={onRouteClick}
          onPolygonClick={onPolyonClick}
          onCircleClick={onCircleClick}
          onPinToggle={() => setShowMarker((prev) => !prev)}
          onLetteredActive={() => setIsLetteredActive(true)}
        />

        <div className="tracking-manager">
          <button
            onClick={handleShowForm}
            className="drawing-manager-icon"
            aria-label="Shape Select"
          >
            <i className="bi bi-heptagon" />
            <span className="hover-text">Heptagon</span>
          </button>
        </div>

        <div className="navigation-param">
          <h4 className={isDataChanging ? "color-change" : ""}>
            {`Latitude: ${data.location.lat?.toFixed(2)}`}
          </h4>
          <p>|</p>
          <h4 className={isDataChanging ? "color-change" : ""}>
            {`Longitude: ${data.location.lng?.toFixed(2)}`}
          </h4>
          <p>|</p>
          <h4 className={isDataChanging ? "color-change" : ""}>
            {`Bearing: ${data.bearing?.toFixed(2)}°`}
          </h4>
          <p>|</p>
          <h4 className={isDataChanging ? "color-change" : ""}>
            {`Range: ${data.range?.toFixed(2)} nm`}
          </h4>
          <p>|</p>
          <h4>{`Date: ${data.time}`}</h4>
        </div>

        <RLayerVectorTile
          url={`${window.location}coasttile/{z}/{x}/{y}.pbf`}
          format={format}
          style={styles}
        />

        {visible && type === "Route" && (
          <RLayerVector zIndex={1}>
            <RStyle.RStyle>
              <RStyle.RStroke color="#859F3D" width={2} />
              <RStyle.RFill color="#C4E1F6" />
            </RStyle.RStyle>

            <RInteraction.RDraw
              type="LineString"
              condition={shiftKeyOnly}
              freehandCondition={altShiftKeysOnly}
              onDrawStart={onDrawStart}
              onDrawEnd={onDrawEnd}
            />
          </RLayerVector>
        )}

        {visible && type === "Polygon" && (
          <RLayerVector zIndex={1}>
            <RStyle.RStyle>
              <RStyle.RStroke color="#859F3D" width={2} />
              <RStyle.RFill color="#C4E1F6" />
            </RStyle.RStyle>

            <RInteraction.RDraw
              type="Polygon"
              condition={shiftKeyOnly}
              freehandCondition={altShiftKeysOnly}
              onDrawStart={onDrawStart}
              onDrawEnd={onDrawEnd}
            />
          </RLayerVector>
        )}

      {visible && type === "Circle" && (
          <RLayerVector zIndex={1} ref={newRef}>
            <RStyle.RStyle>
              <RStyle.RStroke color="#859F3D" width={2} />
              <RStyle.RFill color="#C4E1F6" />
            </RStyle.RStyle>

            <RInteraction.RDraw
              type="Circle"
              condition={shiftKeyOnly}
              freehandCondition={altShiftKeysOnly}
              onDrawStart={onDrawStart}
              onDrawEnd={onDrawEnd}
            />
          </RLayerVector>
        )}
<RLayerVector>
{selectedShape ? (
  (() => {
    if (selectedShape.type?.toLowerCase() === "polygon" && selectedShape.cords.coordinates) {
      const polygonCoords = selectedShape.cords.coordinates.map((coord) => fromLonLat(coord));
      return (
        <RFeature
          key={selectedShape.id}
          geometry={new Polygon([polygonCoords])}
          onClick={() => handleFeatureClick(selectedShape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="orange" width={2} />
            <RStyle.RFill color="rgba(255, 165, 0, 0.3)" />
          </RStyle.RStyle>
        </RFeature>
      );
    } else if (selectedShape.type?.toLowerCase() === "circle" && selectedShape.cords.coordinates && selectedShape.cords.radius) {
      const circleCenter = fromLonLat(selectedShape.cords.coordinates);
      return (
        <RFeature
          key={selectedShape.id}
          geometry={new OLCircle(circleCenter, selectedShape.cords.radius)}
          onClick={() => handleFeatureClick(selectedShape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="blue" width={2} />
            <RStyle.RFill color="rgba(0, 0, 255, 0.3)" />
          </RStyle.RStyle>
        </RFeature>
      );
    } else if (selectedShape.assng_route?.type?.toLowerCase() === "linestring" && selectedShape.assng_route?.coordinates) {
      const lineCoords = selectedShape.assng_route.coordinates.map((coord) => fromLonLat(coord));
      return (
        <RFeature
          key={selectedShape.id}
          geometry={new LineString(lineCoords)}
          onClick={() => handleFeatureClick(selectedShape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="green" width={3} lineDash={[10, 10]} />
          </RStyle.RStyle>
        </RFeature>
      );
    }
    return null;
  })()
) : (
  dummyData.map((shape) => {
    if (shape.type?.toLowerCase() === "polygon" && shape.cords.coordinates) {
      const polygonCoords = shape.cords.coordinates.map((coord) => fromLonLat(coord));
      return (
        <RFeature
          key={shape.id}
          geometry={new Polygon([polygonCoords])}
          onClick={() => handleFeatureClick(shape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="orange" width={2} />
            <RStyle.RFill color="rgba(255, 165, 0, 0.3)" />
          </RStyle.RStyle>
        </RFeature>
      );
    } else if (shape.type?.toLowerCase() === "circle" && shape.cords.coordinates && shape.cords.radius) {
      const circleCenter = fromLonLat(shape.cords.coordinates);
      return (
        <RFeature
          key={shape.id}
          geometry={new OLCircle(circleCenter, shape.cords.radius)}
          onClick={() => handleFeatureClick(shape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="blue" width={2} />
            <RStyle.RFill color="rgba(0, 0, 255, 0.3)" />
          </RStyle.RStyle>
        </RFeature>
      );
    } else if (shape.assng_route?.type?.toLowerCase() === "linestring" && shape.assng_route?.coordinates) {
      const lineCoords = shape.assng_route.coordinates.map((coord) => fromLonLat(coord));
      return (
        <RFeature
          key={shape.id}
          geometry={new LineString(lineCoords)}
          onClick={() => handleFeatureClick(shape)} // Add click handler
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="green" width={3} lineDash={[10, 10]} />
          </RStyle.RStyle>
        </RFeature>
      );
    }
    return null;
  })
)}


      </RLayerVector>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Feature Actions"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <h2>Feature Actions</h2>
        <p>Selected Feature: {selectedFeature?.name}</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleEdit} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>
            Edit
          </button>
          <button onClick={handleHide} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#6c757d', color: '#fff', cursor: 'pointer' }}>
            Hide
          </button>
          <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </Modal>


        <RLayerVector ref={layerRef}>
          {features &&
            features?.map((feature) => (
              <RFeature
                geometry={feature.getGeometry()}
                onClick={() => handleFeatureClick(feature)}
              >
                <RStyle.RStyle>
                  <RStyle.RStroke color="#000000" width={1} />
                  <RStyle.RFill color="rgb(14, 234, 241)" />
                </RStyle.RStyle>
                
              </RFeature>
            ))}
        </RLayerVector>

        <RLayerVector>
          {markers?.map((marker: any) => (
            <RFeature
              key={marker.target_id}
              geometry={
                new Point(fromLonLat([marker.longitude, marker.latitude]))
              }
            >
              <ROverlay>
                <img
                  src={
                    marker.unit_name === "Submarine"
                      ? Submarine
                      : marker.unit_name === "Aircraft"
                      ? aircraft
                      : marker.unit_name === "Ship"
                      ? Ship
                      : Plus
                  }
                  style={{
                    position: "relative",
                    top: -aircraftH / 2,
                    left: -aircraftW / 2,
                    userSelect: "none",
                    pointerEvents: "none",
                    transform: `rotate(${
                      marker.course ? marker.course.toFixed(0) : 0
                    }deg)`,
                    transition: "transform 0.5s ease-in-out",
                  }}
                  width={
                    marker.unit_name === "Submarine" ? submarineW : aircraftW
                  }
                  height={
                    marker.unit_name === "Submarine" ? submarineH : aircraftH
                  }
                  alt="Marker"
                />
              </ROverlay>

              <RPopup trigger="hover">
                <div
                  style={{
                    backgroundColor: "black",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    width: "200px",
                    fontSize: "12px",
                    color: "white",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <p>Unit name: {marker?.unit_name}</p>
                  <p>Subtype: {marker?.subtype}</p>
                  <p>Speed: {marker?.speed}</p>
                  <p>Course: {marker?.course}</p>
                  <p>
                    Latitude: {marker?.latitude && marker?.latitude.toFixed(2)}
                  </p>
                  <p>
                    Longitude:{" "}
                    {marker?.longitude && marker?.longitude.toFixed(2)}
                  </p>
                </div>
              </RPopup>
            </RFeature>
          ))}
        </RLayerVector>
      </RMap>

      <ShapeSelectForm
        showForm={showForm}
        handleClose={handleCloseForm}
        handleSubmit={handleFormSubmit}
        setShape={setShape}
        handleSelectedShape = {handleSelectedShape}
        dummyData = {dummyData}
        setDummyData = {setDummyData}
      />


      {circleData && (
        <CircleForm
          cordinate={circleData}
          selectedFeature={selectedFeature}
        />
      )}
    </>
  );
};

export default MapCom;
