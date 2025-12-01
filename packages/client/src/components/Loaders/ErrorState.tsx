import React from "react";

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "crimson" }}>
      <p>{message}</p>
      {onRetry && (
        <button style={{ marginTop: 8 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};
