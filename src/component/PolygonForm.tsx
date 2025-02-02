import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Toast } from "react-bootstrap";
import { BsFillTrashFill } from "react-icons/bs";
import axios from "axios";
import * as turf from "@turf/turf";
import proj4 from "proj4"; // Import proj4 for coordinate conversion
import { Polygon } from "ol/geom";
import * as uuid from 'uuid';
import { createShape } from "../apis/shape";

interface Coordinate {
  latitude: string;
  longitude: string;
}

interface GeoJsonPolygon {
  type: string;
  coordinates: number[][][];
}

interface PolygonFormProps {
  cordinate: any; // GeoJSON object passed from MapCom
  polygonId?: string; // Optional ID for existing polygon to fetch or update
  setForm: (status: boolean) => void;
}

const PolygonForm: React.FC<PolygonFormProps> = ({
  cordinate,
  polygonId,
  setForm,
  handleFormSubmit,
  selectedFeature,
  handleUpdate
}) => {
  const [showModal, setShowModal] = useState(true);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [userName, setUserName] = useState<string>(selectedFeature?.user_name || "");
  const [name, setName] = useState<string>(selectedFeature?.name || "");
  const [description, setDescription] = useState<string>(selectedFeature?.description ||"");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (cordinate?.geometry?.coordinates?.[0]) {
      const convertedCoordinates = cordinate.geometry.coordinates[0].map(
        (coord) => {
          const [easting, northing] = coord;
          const zone = 33;
          const hemisphere = "N";

          const utmPoint = turf.point([easting, northing]);
          const wgs84Point = turf.toWgs84(utmPoint);

          const longitude = wgs84Point.geometry.coordinates[0];
          const latitude = wgs84Point.geometry.coordinates[1];

          return {
            latitude: latitude.toFixed(2),
            longitude: longitude.toFixed(2),
          };
        }
      );

      setCoordinates(convertedCoordinates);
    } else if(selectedFeature?.cords?.coordinates) {
      const convertedCoordinates = selectedFeature?.cords?.coordinates.map((cord)=>{
        return {
          latitude: cord[1],
          longitude: cord[0],
        };
      })
      setCoordinates(convertedCoordinates);
    }
  }, [cordinate]);

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

  const handleSubmit = async () => {
    const polygonData: GeoJsonPolygon = {
      type: "Polygon",
      coordinates: coordinates.map((coord) => [
        parseFloat(coord.longitude),
        parseFloat(coord.latitude),
      ]),
    };

    const submissionData = {
      shapeId: uuid.v4(),
      userName,
      name,
      description,
      cords: polygonData,
      type: "Polygon",
      user_id: 1,
    };
    if(selectedFeature){
      handleUpdate(selectedFeature?.id, submissionData, () => {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        setForm(false);
        setShowModal(false);
      });
    // updateShape(selectedFeature?.id, submissionData, () => {
    //     setShowSuccessMessage(true);
    //     setTimeout(() => setShowSuccessMessage(false), 3000);
    //     setForm(false);
    //     setShowModal(false);
    //   });              ** Un-comment for API
      return
    }
    handleFormSubmit(submissionData, () => {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setForm(false);
      setShowModal(false);
    });
    // createShape(submissionData, () => {
      //   setShowSuccessMessage(true);
      //   setTimeout(() => setShowSuccessMessage(false), 3000);
      //   setForm(false);
      //   setShowModal(false);
      // }) ** Un-comment for API
    return;
  };

  const handleDelete = async () => {
    if (!polygonId) return;
    try {
      await axios.delete(`http://192.168.0.111:5100/shape/${polygonId}`);
      console.log("Polygon deleted successfully");
      setShowModal(false); // Close the modal after successful deletion
    } catch (error) {
      console.error("Error deleting polygon:", error);
    }
  };

  const isFormValid = () =>
    userName.trim() !== "" &&
    name.trim() !== "" &&
    description.trim() !== "" &&
    coordinates.length > 0 
    // && coordinates.every(
    //   (coord) => coord.latitude.trim() !== "" && coord.longitude.trim() !== ""
    // );

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setForm(false);
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
              {polygonId ? "Edit Polygon" : "Add Polygon"}
            </h5>
          </div>
        </Modal.Header>

        <Modal.Body style={{ overflowY: "auto", maxHeight: "450px" }}>
          <Form>
            <Form.Group controlId="polygonUserName" className="mb-3">
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

            <Form.Group controlId="polygonName" className="mb-3">
              <Form.Label style={{ fontSize: "1rem" }}>Name</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Polygon Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>

            <Form.Group controlId="polygonDescription" className="mb-3">
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
            style={{ marginRight: "300px" }}
            onClick={handleAddCoordinate}
          >
            Add Coordinate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setShowModal(false);
              setForm(false);
            }}
          >
            Close
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
           {selectedFeature ? 'Update':'Add'} 
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
          Polygon {polygonId ? "updated" : "created"} successfully!
        </Toast.Body>
      </Toast>
    </>
  );
};

export default PolygonForm;
