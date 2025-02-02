import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Toast } from "react-bootstrap";
import { BsFillTrashFill } from "react-icons/bs";
import axios from "axios";
import * as turf from "@turf/turf";
import proj4 from "proj4"; // Import proj4 for coordinate conversion

interface Coordinate {
  latitude: string;
  longitude: string;
}

// interface GeoJsonPolygon {
//   type: string;
//   coordinates: number[][][];
// }

interface letteredFormProps {
  cordinate: any; // GeoJSON object passed from MapCom
  polygonId?: string; // Optional ID for existing polygon to fetch or update
  // setForm: (status: boolean) => void;
  setLetteredForm: (status: boolean) => void;
}

const LetteredForm: React.FC<letteredFormProps> = ({
  cordinate,
  polygonId,
  // setForm,
  setLetteredForm,
}) => {
  const [showModal, setShowModal] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    {
      latitude: cordinate.latitude,
      longitude: cordinate.longitude,
    },
  ]);

  useEffect(() => {
    console.log("cordinate", cordinate);
  }, [cordinate]);

  // In LetteredForm.tsx (as you have it already)
  useEffect(() => {
    if (cordinate?.geometry?.coordinates?.[0]) {
      const convertedCoordinates = cordinate.geometry.coordinates[0].map(
        (coord: [number, number]) => {
          const [longitude, latitude] = coord; // Coordinates are already in [longitude, latitude] format from MapCom
          return {
            latitude: latitude.toFixed(2),
            longitude: longitude.toFixed(2),
          };
        }
      );
      console.log("Converted Coordinates:", convertedCoordinates);

      setCoordinates(convertedCoordinates);
    }
  }, [cordinate]);

  useEffect(() => {
    const checkFormValidity = () => {
      const isValid =
        userName.trim() !== "" &&
        name.trim() !== "" &&
        description.trim() !== "" &&
        coordinates.length > 0 &&
        coordinates.every(
          (coord) =>
            coord.latitude.trim() !== "" && coord.longitude.trim() !== ""
        );

      setIsValid(isValid);
    };

    checkFormValidity();
  }, [userName, name, description, coordinates]);

  const handleAddCoordinate = () => {
    setCoordinates([...coordinates, { latitude: "", longitude: "" }]);
  };

  const handleCoordinateChange = (
    index: number,
    field: "latitude" | "longitude",
    value: string
  ) => {
    const newCoordinates = [...coordinates];
    newCoordinates[index][field] = value;
    setCoordinates(newCoordinates);
  };

  const handleDeleteCoordinate = (index: number) => {
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setShowModal(false);
    // setForm(false);
    setLetteredForm(false);
  };

  const handleSubmit = async () => {
    const letteredData = {
      name: name,
      description: description,
      cords: {
        cordinates: coordinates.map((coord) => [
          parseFloat(coord.latitude),
          parseFloat(coord.longitude),
        ]),
      },
      curr_time: new Date().toLocaleDateString(),
    };

    try {
      const response = await axios.post(
        "http://192.168.0.200:5100/mark",
        letteredData
      );
      console.log("Data successfully submitted:", response.data);
      // setForm(false);
      setLetteredForm(false);
      handleClose();
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("There was an error submitting the data:", error);
    }
  };

  const handleDelete = () => {};

  return (
    <>
      <Modal
        show={showModal}
        //   show={true}
        onHide={() => {
          setShowModal(false);
          // setForm(false);
          setLetteredForm(false);
        }}
        centered
        size="lg"
        style={{
          maxWidth: "600px",
          width: "100%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1050,
        }}
      >
        <Modal.Header closeButton>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h5 style={{ fontSize: "1.1rem" }}>
              {/* {polygonId ? "Edit Polygon" : "Add Polygon"} */}
              Add Location
            </h5>
          </div>
        </Modal.Header>

        <Modal.Body style={{ overflowY: "auto", maxHeight: "450px" }}>
          <Form>
            <Form.Group controlId="locationUserName" className="mb-3">
              <Form.Label style={{ fontSize: "1rem" }}>UserName</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter UserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>

            <Form.Group controlId="loactionName" className="mb-3">
              <Form.Label style={{ fontSize: "1rem" }}>Name</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Location Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>

            <Form.Group controlId="loactionDescription" className="mb-3">
              <Form.Label style={{ fontSize: "1rem" }}>Description</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h6 style={{ fontSize: "1.1rem" }}>Coordinates</h6>
            </div>

            <Table size="sm" striped bordered hover style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: "1rem" }}>Latitude</th>
                  <th style={{ fontSize: "1rem" }}>Longitude</th>
                  <th style={{ fontSize: "1rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coordinates.map((coord, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Latitude"
                        value={coord.latitude}
                        onChange={(e) =>
                          handleCoordinateChange(
                            index,
                            "latitude",
                            e.target.value
                          )
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Longitude"
                        value={coord.longitude}
                        onChange={(e) =>
                          handleCoordinateChange(
                            index,
                            "longitude",
                            e.target.value
                          )
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteCoordinate(index)}
                        size="sm"
                      >
                        <BsFillTrashFill />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            size="sm"
            style={{ marginRight: "325px" }}
            onClick={handleAddCoordinate}
          >
            Add Coordinate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setShowModal(false);
              // setForm(false);
              setLetteredForm(false);
            }}
          >
            Close
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {polygonId ? "Update" : "Add"}
          </Button>
          {polygonId && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Toast
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
        show={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        delay={3000}
        autohide
      >
        <Toast.Body>
          Lettered Data {polygonId ? "updated" : "created"} successfully!
        </Toast.Body>
      </Toast>
    </>
  );
};
export default LetteredForm;
