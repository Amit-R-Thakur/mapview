import axios from "axios";
import React, { useState } from "react";
import { Button, Modal, Table, Form, Toast } from "react-bootstrap";
import { BsFillTrashFill } from "react-icons/bs";
import { fromLonLat } from "ol/proj";
import { Circle as OL_Circle } from "ol/geom";
import * as uuid from 'uuid';
import { createShape, updateShape } from "../apis/shape";

interface Coordinate {
  latitude: string;
  longitude: string;
  radius: string; 
}

interface CircleFormProps {
  cordinate: any;
  circleId?: string; 
  setCircleForm: (status: boolean) => void;
  selectedFeature: any; 
  layerRef: any; 
  selectedFeature1: any;
}

const CircleForm: React.FC<CircleFormProps> = ({
  cordinate,
  circleId,
  setCircleForm,
  layerRef,
  handleFormSubmit,
  selectedFeature,
  handleUpdate
}) => {
  const [showModal, setShowModal] = useState(true);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    {
      latitude:
        cordinate?.geometry?.coordinates[1]?.toFixed(2) ||
        selectedFeature?.cords?.coordinates[1] ||
        0,
      longitude:
        cordinate?.geometry?.coordinates[0]?.toFixed(2) ||
        selectedFeature?.cords?.coordinates[0] ||
        0,
      radius:
        cordinate?.geometry?.radius?.toFixed(2) ||
        selectedFeature?.cords?.radius ||
        0,
    },
  ]);
  const [userName, setUserName] = useState<string>(selectedFeature?.user_name || "");
  const [name, setName] = useState<string>(selectedFeature?.name || "");
  const [description, setDescription] = useState<string>(selectedFeature?.description || "");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const handleClose = () => {
    setShowModal(false);
    setCircleForm(false);
  };


  const handleCoordinateChange = (
    index: number,
    field: "latitude" | "longitude" | "radius",
    value: string
  ) => {
    const newCoordinates = [...coordinates];
    newCoordinates[index][field] = value;
    setCoordinates(newCoordinates);

    // Check if the radius has changed
    const newRadius = parseFloat(newCoordinates[0].radius);
    const oldRadius = parseFloat(coordinates[0].radius);

    // Update the geometry of the circle if the radius has changed
    if (selectedFeature) {
      const [longitude, latitude] = [
        parseFloat(newCoordinates[0].longitude),
        parseFloat(newCoordinates[0].latitude),
      ];

      // Update the geometry only if the radius has changed
      if (newRadius !== oldRadius) {
        const newGeometry = new OL_Circle(
          fromLonLat([longitude, latitude]),
          newRadius
        );
        selectedFeature.setGeometry(newGeometry);

        // Force layer to re-render
        if (layerRef.current) {
          layerRef.current.source.changed();
        }

        // Show alert when size is changed
        alert("The size of the circle has been updated!");
      }
    }
  };

  const handleDeleteCoordinate = (index: number) => {
    const newCoordinates = coordinates.filter((_, i) => i !== index);
    setCoordinates(newCoordinates);
  };

  const handleSubmit = async () => {
    const circleData = {
      shapeId: uuid.v4(),
      user_name: userName,
      name: name,
      description: description,
      cords: {
        coordinates: [Number.parseFloat(coordinates[0].longitude), Number.parseFloat(coordinates[0].latitude)], // Convert each coordinate to [lat, long, radius] format
        radius: Number.parseFloat(coordinates[0].radius),
        type: "Circle",
      },
      type: "circle",
      user_id: 1, 
    };

    if(selectedFeature){
      handleUpdate(selectedFeature?.id, circleData, handleClose);
     // updateShape(selectedFeature?.id, circleData, handleClose);  ** Un-comment for API
      return
    }
    handleFormSubmit(circleData, handleClose);
    // createShape(circleData, handleClose) ** Un-comment for API
    return;

  };

  const isFormValid = () =>
    userName.trim() !== "" &&
    name.trim() !== "" &&
    description.trim() !== "" &&
    coordinates.length > 0 
    // &&coordinates.every(
    //   (coord) =>
    //     coord?.latitude?.trim() !== "" &&
    //     coord?.longitude?.trim() !== "" &&
    //     coord?.radius?.trim() !== ""
    // )
    ;

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => {
          handleClose();
          setCircleForm(false);
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
            <h5 style={{ fontSize: "1.1rem" }}>Add Circle</h5>
          </div>
        </Modal.Header>

        <Modal.Body style={{ overflowY: "auto", maxHeight: "450px" }}>
          <Form>
            <Form.Group controlId="circleName" className="mb-3">
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

            <Form.Group controlId="circleName" className="mb-3">
              <Form.Label style={{ fontSize: "1rem" }}>Name</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Circle Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>

            <Form.Group controlId="circleDescription" className="mb-3">
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

            <Table size="sm" striped bordered hover>
              <thead>
                <tr>
                  <th style={{ fontSize: "1rem" }}>Latitude</th>
                  <th style={{ fontSize: "1rem" }}>Longitude</th>
                  <th style={{ fontSize: "1rem" }}>Radius (m)</th>
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
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Radius"
                        value={coord.radius}
                        onChange={(e) =>
                          handleCoordinateChange(
                            index,
                            "radius",
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
          {/* <Button
            variant="primary"
            size="sm"
            style={{ marginRight: "325px" }}
            onClick={handleAddCoordinate}
          >
            Add Coordinate
          </Button> */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              handleClose();
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            size="sm"
            disabled={!isFormValid()}
          >
           {selectedFeature ? 'Update':'Add'} 
          </Button>
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
          Circle {circleId ? "updated" : "created"} successfully!
        </Toast.Body>
      </Toast>
    </>
  );
};

export default CircleForm;
