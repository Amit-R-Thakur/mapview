import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons

interface NameInputProps {
  position: string;
}

const Auth: React.FC<NameInputProps> = ({ position }) => {
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const handleSubmit = () => {
    if (name) {
      setSubmittedName(name);
    }
  };

  const handleEdit = () => {
    setSubmittedName(null); // Reset the submitted name
    setName(""); // Clear the input field
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {submittedName ? (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            animation: "fadeIn 0.5s ease-in-out", // Add fade-in animation
          }}
        >
          <span
            style={{
              marginRight: "10px",
              animation: "blink 1s step-start infinite", // Blink animation
            }}
          >
            {submittedName}
          </span>
          <i
            className="bi bi-pencil-fill" // Bootstrap pencil icon
            onClick={handleEdit}
            style={{
              fontSize: "16px",
              color: "#007bff",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#007bff")}
          ></i>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row", // Input and arrow button in one row
            alignItems: "center",
            gap: "8px", // Space between input and button
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="form-control form-control-sm animated-input" // Add a custom class for styling
            style={{
              width: "120px", // Small input field width
              fontSize: "14px", // Smaller font size
              color: "black", // Text color inside the input
              backgroundColor: "white", // Initial background color
              border: "1px solid #ccc",
              borderRadius: "5px", // Rounded corners
            }}
          />

          <i
            className="bi bi-arrow-right-circle-fill" // Bootstrap arrow icon
            onClick={handleSubmit}
            style={{
              fontSize: "24px",
              // color: "#007bff", // Blue color
              color: "black",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#007bff")}
            title="Next" // Tooltip for accessibility
          ></i>
        </div>
      )}
    </div>
  );
};

export default Auth;
