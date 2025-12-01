import React from "react";

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div role="status" aria-busy="true" style={{ marginBottom: 8 }}>
        <svg width="28" height="28" viewBox="0 0 50 50" aria-hidden>
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor" strokeDasharray="31.4 31.4"></circle>
        </svg>
      </div>
      <div>{message}</div>
    </div>
  );
};
