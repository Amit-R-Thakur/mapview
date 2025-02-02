import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import { Polygon, Circle } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke } from "ol/style";
import "ol/ol.css";

interface ShapeSelectFormProps {
  showForm: boolean;
  handleClose: () => void;
  handleSubmit: (geometry: Geometry) => void;
  setShape: any;
}

interface Shape {
  id: string;
  name: string;
  type: string; // To differentiate shape types (e.g., Polygon, Route)
  coordinates: number[][]; // Array of coordinates
}

interface Geometry {
  type: string;
  coordinates: number[][][];
}

const data = {
  data: [
    {
      id: 4,
      name: "acs",
      description: "sca",
      cords: {
        coordinates: [[25.65, 77.39]],
        radius: [142204.1],
        type: "Circle",
      },
      type: "circle",
      user_id: 1738143469,
      curr_time: "1970-01-01T00:00:01+00:00",
    },
    {
      id: 3,
      name: "sac",
      description: "sca",
      cords: {
        coordinates: [[25.96, 72.78]],
        type: "Circle",
      },
      type: "circle",
      user_id: 1738142988,
      curr_time: "1970-01-01T00:00:01+00:00",
    },
    {
      id: 2,
      name: "ed",
      description: "as",
      cords: {
        coordinates: [[13.2, 78.84, 260011.76]],
        type: "Polygon",
      },
      type: "circle",
      user_id: 1738142460,
      curr_time: "1970-01-01T00:00:01+00:00",
    },
    {
      id: 1,
      name: "DD",
      description: "hj",
      cords: {
        type: "Polygon",
        coordinates: [
          [
            [76.73, 24.37],
            [73.26, 16.64],
            [80.42, 16.09],
            [76.73, 24.37],
          ],
        ],
      },
      type: "Polygon",
      user_id: 1738142436,
      curr_time: "1970-01-01T00:00:01+00:00",
    },
  ],
};

const ShapeSelectForm: React.FC<ShapeSelectFormProps> = ({
  showForm,
  handleClose,
  handleSubmit,
  setShape,
  handleSelectedShape,
  dummyData
}) => {
  const [shapeType, setShapeType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [namesList, setNamesList] = useState<Shape[]>(data?.data);
  const [filteredList, setFilteredList] = useState<Shape[]>([]);
  const [map, setMap] = useState<Map | null>(null);
  const [vectorSource, setVectorSource] = useState<VectorSource | null>(null);

  // Initialize the map
  useEffect(() => {
    const initialVectorSource = new VectorSource();
    const initialMap = new Map({
      layers: [
        new TileLayer({
          source: new OSMSource(),
        }),
        new VectorLayer({
          source: initialVectorSource,
        }),
      ],
      target: "map",
      view: new View({
        center: fromLonLat([77.39, 25.65]), // Center on India
        zoom: 5,
      }),
    });

    setMap(initialMap);
    setVectorSource(initialVectorSource);

    return () => {
      initialMap.setTarget(undefined); // Cleanup map on unmount
    };
  }, []);

  // Add shapes to the map based on the selected type
  useEffect(() => {
    if (!vectorSource || !map) return;

    vectorSource.clear(); // Clear existing features

    const selectedShape = namesList.find((shape) => shape.id === name);
    if (selectedShape) {
      const { cords } = selectedShape;

      if (cords.type === "Polygon") {
        const polygonCoordinates = cords.coordinates[0].map((coord) =>
          fromLonLat(coord)
        );
        const polygon = new Polygon([polygonCoordinates]);
        vectorSource.addFeature(
          new ol.Feature({
            geometry: polygon,
            style: new Style({
              fill: new Fill({
                color: "rgba(255, 0, 0, 0.2)",
              }),
              stroke: new Stroke({
                color: "#ff0000",
                width: 2,
              }),
            }),
          })
        );
      } else if (cords.type === "Circle") {
        const [longitude, latitude] = cords.coordinates[0];
        const radius = cords.radius ? cords.radius[0] : 100000; // Default radius if not provided
        const circle = new Circle(fromLonLat([longitude, latitude]), radius);
        vectorSource.addFeature(
          new ol.Feature({
            geometry: circle,
            style: new Style({
              fill: new Fill({
                color: "rgba(0, 0, 255, 0.2)",
              }),
              stroke: new Stroke({
                color: "#0000ff",
                width: 2,
              }),
            }),
          })
        );
      }
    }
  }, [name, vectorSource, map, namesList]);

  const handleShapeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShapeType(event.target.value);
    setName(""); // Reset the name when shape type changes
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setName(selectedId); // Set the selected name (ID)
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Convert form data to an object
    const {shapeId} = Object.fromEntries(formData.entries());

    handleSelectedShape(shapeId)
   

    handleClose();
  };

  return (
    <Modal
      show={showForm}
      onHide={handleClose}
      centered
      size="lg"
      aria-labelledby="shapeSelectModal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="shapeSelectModal">Select Shape</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group>
            <Form.Label>Type :</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Polygon"
                name="shapeType"
                value="Polygon"
                checked={shapeType === "Polygon"}
                onChange={handleShapeChange}
              />
              <Form.Check
                type="radio"
                label="Route"
                name="shapeType"
                value="LineString"
                checked={shapeType === "LineString"}
                onChange={handleShapeChange}
              />
              <Form.Check
                type="radio"
                label="Circle"
                name="shapeType"
                value="Circle"
                checked={shapeType === "Circle"}
                onChange={handleShapeChange}
              />
              <hr />
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label>Name :</Form.Label>
            <Form.Control
              as="select"
              value={name}
              onChange={handleNameChange}
              required
              disabled={!shapeType} // Disable dropdown if no shape type is selected
              name="shapeId"
            >
              <option value="">Select Name</option>
              {dummyData
                .filter((shape) => shape.type?.toLowerCase() === shapeType?.toLowerCase() 
                || shape?.assng_route?.type?.toLowerCase()?.toLowerCase() === shapeType?.toLowerCase())
                .map(({ shapeId, name, route_name }: Shape) => (
                  <option key={shapeId} value={shapeId}>
                    {name || route_name}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
          <Button
            variant="outline-success"
            type="submit"
            style={{ marginTop: "20px", marginLeft: "690px" }}
            disabled={!name || !shapeType} // Disable submit button if no name or shape type is selected
          >
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <div id="map" style={{ width: "100%", height: "400px" }}></div>
    </Modal>
  );
};

export default ShapeSelectForm;

///////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import axios from "axios";

// interface ShapeSelectFormProps {
//   showForm: boolean;
//   handleClose: () => void;
//   handleSubmit: (geometry: Geometry) => void;
//   setShape: any;
// }

// interface Shape {
//   id: string;
//   name: string;
//   type: string; // To differentiate shape types (e.g., Polygon, Route)
//   coordinates: number[][]; // Array of coordinates
// }

// interface Geometry {
//   type: string;
//   coordinates: number[][][];
// }

// const data = {
//   data: [
//     {
//       id: 4,
//       name: "acs",
//       description: "sca",
//       cords: {
//         coordinates: [[25.65, 77.39]],
//         radius: [142204.1],
//         type: "Circle",
//       },
//       type: "circle",
//       user_id: 1738143469,
//       curr_time: "1970-01-01T00:00:01+00:00",
//     },
//     {
//       id: 3,
//       name: "sac",
//       description: "sca",
//       cords: {
//         coordinates: [[25.96, 72.78]],
//         type: "Circle",
//       },
//       type: "circle",
//       user_id: 1738142988,
//       curr_time: "1970-01-01T00:00:01+00:00",
//     },
//     {
//       id: 2,
//       name: "ed",
//       description: "as",
//       cords: {
//         coordinates: [[13.2, 78.84, 260011.76]],
//         type: "Polygon",
//       },
//       type: "circle",
//       user_id: 1738142460,
//       curr_time: "1970-01-01T00:00:01+00:00",
//     },
//     {
//       id: 1,
//       name: "DD",
//       description: "hj",
//       cords: {
//         type: "Polygon",
//         coordinates: [
//           [
//             [76.73, 24.37],
//             [73.26, 16.64],
//             [80.42, 16.09],
//             [76.73, 24.37],
//           ],
//         ],
//       },
//       type: "Polygon",
//       user_id: 1738142436,
//       curr_time: "1970-01-01T00:00:01+00:00",
//     },
//   ],
// };

// const ShapeSelectForm: React.FC<ShapeSelectFormProps> = ({
//   showForm,
//   handleClose,
//   handleSubmit,
//   setShape,
// }) => {
//   const [shapeType, setShapeType] = useState<string>("");
//   const [name, setName] = useState<string>("");
//   const [namesList, setNamesList] = useState<Shape[]>(data?.data);
//   const [filteredList, setFilteredList] = useState<Shape[]>([]);

//   // // Fetch available names from the backend
//   // useEffect(() => {
//   //   const fetchNames = async () => {
//   //     try {
//   //       const response = await axios.get("http://192.168.0.111:5100/shape");
//   //       console.log("Fetched data:", response.data.data);
//   //       setNamesList(response?.data?.data);
//   //     } catch (error) {
//   //       console.error("Error fetching names:", error);
//   //     }
//   //   };

//   //   fetchNames();
//   // }, []);

//   const handleShapeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setShapeType(event.target.value);
//     setName(""); // Reset the name when shape type changes
//   };

//   const handleNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedId = event.target.value;
//     setName(selectedId); // Set the selected name (ID)
//   };

//   const onSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     console.log("namesList", namesList);

//     const selectedShape = namesList.find((shape) => shape.id === name);

//     if (selectedShape) {
//       const geometry: Geometry = {
//         type: shapeType || "Polygon", // Default to Polygon
//         coordinates: [selectedShape.coordinates],
//       };

//       console.log("Transformed Geometry Object:", geometry);
//       setShape(geometry);
//       handleSubmit(geometry);
//     } else {
//       console.error("No shape selected or invalid ID.");
//     }

//     handleClose();
//   };

//   useEffect(() => {
//     console.log("namesList", namesList);
//   }, [namesList]);

//   useEffect(() => {
//     console.log("shapeType", shapeType);
//   }, [shapeType]);

//   return (
//     <Modal
//       show={showForm}
//       onHide={handleClose}
//       centered
//       size="lg"
//       aria-labelledby="shapeSelectModal"
//     >
//       <Modal.Header closeButton>
//         <Modal.Title id="shapeSelectModal">Select Shape</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={onSubmit}>
//           <Form.Group>
//             <Form.Label>Type :</Form.Label>
//             <div>
//               <Form.Check
//                 type="radio"
//                 label="Polygon"
//                 name="shapeType"
//                 value="Polygon"
//                 checked={shapeType === "Polygon"}
//                 onChange={handleShapeChange}
//               />
//               <Form.Check
//                 type="radio"
//                 label="Route"
//                 name="shapeType"
//                 value="Route"
//                 checked={shapeType === "Route"}
//                 onChange={handleShapeChange}
//               />
//               <Form.Check
//                 type="radio"
//                 label="Circle"
//                 name="shapeType"
//                 value="Circle"
//                 checked={shapeType === "Circle"}
//                 onChange={handleShapeChange}
//               />
//               <hr />
//             </div>
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Name :</Form.Label>
//             <Form.Control
//               as="select"
//               value={name}
//               onChange={handleNameChange}
//               required
//               disabled={!shapeType} // Disable dropdown if no shape type is selected
//             >
//               <option value="">Select Name</option>
//               {namesList
//                 .filter((name) => name.type === shapeType)
//                 .map(({ id, name }: Shape) => (
//                   <option key={id} value={id}>
//                     {name}
//                   </option>
//                 ))}
//             </Form.Control>
//           </Form.Group>
//           <Button
//             variant="outline-success"
//             type="submit"
//             style={{ marginTop: "20px", marginLeft: "690px" }}
//             disabled={!name || !shapeType} // Disable submit button if no name or shape type is selected
//           >
//             Submit
//           </Button>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ShapeSelectForm;
