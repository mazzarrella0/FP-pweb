import React from "react";

export const EmptyState: React.FC<{ message?: string }> = ({ message = "No data found." }) => {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;