import React from "react";
import { IonSpinner } from "@ionic/react";

const LoadingOverlay: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <IonSpinner name="crescent" style={{ marginBottom: 20 }} />
      <p>{message}</p>
    </div>
  );
};

export default LoadingOverlay;
