import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Toast } from "react-bootstrap";
import { BsFillTrashFill } from "react-icons/bs";
import * as turf from "@turf/turf";
import * as uuid from 'uuid';

const RouteForm: React.FC<{
  cordinate: any;
  onRouteRemoved: () => void;
  setRootForm: (status: boolean) => void;
}> = ({
  cordinate,
  onRouteRemoved,
  setRootForm,
  handleFormSubmit,
  selectedFeature,
  handleUpdate,
}) => {
  const [showModal, setShowModal] = useState(true);
  const [coordinates, setCoordinates] = useState<
    { latitude: string; longitude: string }[]
  >([]);
  const [userName, setUserName] = useState<string>(selectedFeature?.user_name || "");
  const [name, setName] = useState<string>(selectedFeature?.route_name || "");
  const [description, setDescription] = useState<string>(selectedFeature?.description || "");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const handleClose = () => setShowModal(false);

  // speed
  const speed = Math.trunc(Math.random() * 20) + 1;

  const handleAddCoordinate = () => {
    setCoordinates([...coordinates, { latitude: "", longitude: "" }]);
  };

  const handleCoordinateChange = (
    index: number,
    field: "latitude" | "longitude | speed",
    value: string
  ) => {
    const newCoordinates = [...coordinates];
    newCoordinates[index][field] = value.trim(); // Make sure the value is a string
    setCoordinates(newCoordinates);
  };

  const handleDeleteCoordinate = (index: number) => {
    const newCoordinates = coordinates.filter((_, i) => i !== index);
    setCoordinates(newCoordinates);
  };

  const handleSubmit = async () => {
    const assngRouteCoordinates = coordinates.map((coord) => [
      parseFloat(coord.longitude),
      parseFloat(coord.latitude),
    ]);

    const basePt = {
      lat: 13,
      long: 72,
    };

    const routeData = {
      shapeId: uuid.v4(),
      route_name: name,
      assng_route: {
        type: "LineString",
        coordinates: assngRouteCoordinates,
      },
      speed: coordinates.map((coord) => coord.speed || speed),
      stop: true,
      base_pt: basePt,
      type: "LineString",
      user_id: 1,
    };


    if(selectedFeature){
      handleUpdate(selectedFeature?.id, routeData,  () => {
        setShowSuccessMessage(true);
        setRootForm(false);
        handleClose();
      });
      // updateRoute(selectedFeature?.id, routeData,  () => {
    //   setShowSuccessMessage(true);
    //   setRootForm(false);
    //   handleClose();
    // });  ** Un-comment for API
      return
    }
    handleFormSubmit(routeData, () => {
      setShowSuccessMessage(true);
      setRootForm(false);
      setShowModal(false);
      handleClose();
    });
    // createRoute(routeData, () => {
    //   setShowSuccessMessage(true);
    //   setRootForm(false);
    //   handleClose();
    // }) ** Un-comment for API
    return;
  };


  useEffect(() => {
   
    if (cordinate?.geometry?.coordinates) {
      const convertedCoordinates = cordinate.geometry.coordinates
        .map((coord) => {
          if (Array.isArray(coord) && coord.length === 2) {
            const [easting, northing] = coord;

            const utmPoint = turf.point([easting, northing]);
            const wgs84Point = turf.toWgs84(utmPoint);

            return {
              latitude: parseFloat(
                wgs84Point.geometry.coordinates[1].toFixed(2)
              ),
              longitude: parseFloat(
                wgs84Point.geometry.coordinates[0].toFixed(2)
              ),
            };
          }
          return null; 
        })
        .filter((coord) => coord !== null); 

      setCoordinates(convertedCoordinates);
    }

    if(selectedFeature?.assng_route?.coordinates){
     const convertedCoordinates = selectedFeature?.assng_route?.coordinates?.map((cord: any)=>{
        return {
          latitude: parseFloat(
            cord[1].toFixed(2)
          ),
          longitude: parseFloat(
            cord[0].toFixed(2)
          ),
        };
      })
      setCoordinates(convertedCoordinates);
    }
  }, [cordinate]);


  const isFormValid = () => {
    return (
      userName.trim() !== "" &&
      name.trim() !== "" &&
      description.trim() !== "" &&
      coordinates.length > 0 && coordinates.every(
        (coord) =>
          coord.latitude.toString().trim() !== "" &&
          coord.longitude.toString().trim() !== ""
      )
    );
  };


  return (
    <>
      <Modal
        show={showModal}
        onHide={() => {
          handleClose;
          setRootForm(false);
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
            <h5>Add Route</h5>
          </div>
        </Modal.Header>

        <Modal.Body style={{ overflowY: "auto", maxHeight: "450px" }}>
          <Form>
            <Form.Group controlId="routeName" className="mb-3">
              <Form.Label>UserName</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter UserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="routeName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Route Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="routeDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h6>Coordinates</h6>
            </div>

            <Table size="sm" striped bordered hover>
              <thead>
                <tr>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Speed</th> {/* New column for Speed */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coordinates.map((coord, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Control
                        type="text"
                        value={coord.latitude.toString()} // Convert to string
                        onChange={(e) =>
                          handleCoordinateChange(
                            index,
                            "latitude",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={coord.longitude.toString()} // Convert to string
                        onChange={(e) =>
                          handleCoordinateChange(
                            index,
                            "longitude",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number" // Use type="number" for speed input
                        value={speed} // Assuming speed is part of the coordinate object
                        onChange={(e) =>
                          handleCoordinateChange(index, "speed", e.target.value)
                        }
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
            style={{ marginRight: "300px" }}
            variant="primary"
            size="sm"
            onClick={handleAddCoordinate}
          >
            Add Coordinate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              handleClose;
              setRootForm(false);
            }}
          >
            Close
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleSubmit}
            disabled={!isFormValid()} // This disables the button if form is not valid
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
        <Toast.Body>Data successfully submitted!</Toast.Body>
      </Toast>
    </>
  );
};

export default RouteForm;
