import MapCom from "./component/MapCom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PolygonForm from "./component/PolygonForm";
import { useEffect, useState } from "react";
import RouteForm from "./component/RouteForm";
import CircleForm from "./component/CicleForm";
import Auth from "./component/Auth";
import LetteredForm from "./component/LetteredForm";
// import Work from "./component/Work";
const data1 = [
  {
     id: 5,
    "shapeId": 121,
    "route_name": "test",
    "assng_route": {
      "type": "LineString",
      "coordinates": [
        [
            79.32,
            22
        ],
        [
            77.9,
            18.14
        ]
    ]
    },
    "speed": [
      20,
      20
    ],
    "stop": true,
    "base_pt": {
      "lat": 18.115059,
      "long": 72.72919
    },
    "type" : "LineString",
    "description": "gajgd"
  },
  {
    id: 7,
    shapeId: 3,
    name: "Delhi NCR",
    description: "Covers the Delhi region with radius",
    cords: {
      type: "Circle",
      coordinates: [77.23, 28.61], // Delhi
      radius: 500000, // 500 km radius
    },
    type: "Circle",
    userName: "aaa",
    user_id: 1
  },
  {
    id: 8,
    shapeId: 888,
    "user_name": "Test",
    "name": "Circle Test",
    "description": "dqawff",
    "cords": {
        "coordinates": [ 94.36, 15.56 ],
        "radius": 393698.20,
        "type": "Circle"
    },
    "type": "circle",
    "user_id": 1
},
  {
    id: 9,
    shapeId: 1,
    name: "North India Region",
    description: "Covers Rajasthan, UP, MP, Gujarat",
    cords: {
      type: "Polygon",
      coordinates: [
        [
            79.16,
            26.99
        ],
        [
            76.42,
            22.83
        ],
        [
            83.7,
            24.04
        ],
        [
            79.16,
            26.99
        ]
    ],
    },
    type: "Polygon",
    userName: "aaa",
    user_id: 1
  },
  {
    id: 10,
    shapeId: 2,
    name: "South India Region",
    description: "Covers Karnataka, AP, Tamil Nadu, Kerala",
    cords: {
      type: "Polygon",
      coordinates: [
        [75.0, 16.0], // Top Left
        [80.0, 16.0], // Top Right
        [80.0, 10.0], // Bottom Right
        [75.0, 10.0], // Bottom Left
        [75.0, 16.0], // Close Polygon
      ],
    },
    type: "Polygon",
    userName: "aaa",
    user_id: 1
  },
  {
    id: 11,
    shapeId: 4,
    name: "Mumbai Metropolitan",
    description: "Covers Mumbai with radius",
    cords: {
      type: "Circle",
      coordinates: [72.83, 19.07],
      radius: 400000,
    },
    type: "Circle",
    userName: "aaa",
    user_id: 1
  },
  {
    id: 12,
    shapeId: 5,
    name: "Delhi-Mumbai Route",
    description: "Example Route from Delhi to Mumbai",
    cords: {
      type: "LineString",
      coordinates: [
        [77.23, 28.61],
        [78.48, 23.02],
        [78.37, 17.38],
        [72.83, 19.07],
      ],
    },
    userName: "aaa",
    user_id: 1,
    type: "LineString",
  },


  {
    "shapeId": 99,
    "name": "dc",
    "description": "acs",
    "cords": {
      "type": "Polygon",
      "coordinates": [
          [
        [
            [
                94.09,
                33.58
            ],
            [
                91.51,
                29.86
            ],
            [
                99.84,
                29.08
            ],
            [
                102.37,
                33.4
            ],
            [
                94.09,
                33.58
            ]
        ]
    ]
      ]
    },
    "type": "Polygon",
    "user_id": 1738395239,
    "curr_time": "1970-01-01T00:00:01+00:00"
  }
];

function App() {
  const [cordinate, setCordinate] = useState(null);
  const [form, setForm] = useState(false);
  const [rootForm, setRootForm] = useState(false);
  const [circleForm, setCircleForm] = useState(false);
  const [letteredForm, setLetteredForm] = useState(false);
  const [dummyData, setDummyData] = useState(data1);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  

  const handleFormSubmit = (data, callback) => {
    setDummyData((prev)=>[...prev, data])
    callback();
  }

  const handleUpdate = (id, updatedData:any, callback) => {
    setDummyData((prev) => 
      prev.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
    callback();
  }

  useEffect(() => {
    console.log(dummyData);
  }, [dummyData]);

  useEffect(() => {
    console.log(cordinate);
    console.log(circleForm);
    console.log(letteredForm);
  }, [cordinate, circleForm, letteredForm]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapCom
        setCordinate={setCordinate}
        setForm={setForm}
        setRootForm={setRootForm}
        setCircleForm={setCircleForm}
        setLetteredForm={setLetteredForm}
        setDummyData = {setDummyData}
        dummyData = {dummyData}
        selectedFeature = {selectedFeature}
        setSelectedFeature = {setSelectedFeature}
      />

      {form && <PolygonForm handleUpdate= {handleUpdate} selectedFeature= {selectedFeature}  handleFormSubmit= {handleFormSubmit} setForm={setForm} cordinate={cordinate} />}

      {rootForm && (
        <RouteForm handleUpdate= {handleUpdate} selectedFeature= {selectedFeature} setRootForm={setRootForm} cordinate={cordinate} handleFormSubmit = {handleFormSubmit}/>
      )}

      {circleForm && (
        <CircleForm handleUpdate= {handleUpdate} selectedFeature= {selectedFeature} setCircleForm={setCircleForm} cordinate={cordinate} handleFormSubmit = {handleFormSubmit}/>
      )}

      {letteredForm && (
        <LetteredForm handleUpdate= {handleUpdate} selectedFeature= {selectedFeature} setLetteredForm={setLetteredForm} cordinate={cordinate} />
      )}
    </div>
  );
}

export default App;