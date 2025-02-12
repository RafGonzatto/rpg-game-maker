// Input.jsx
import React from "react";

export const Input = ({ prefixIcon, className = "", ...props }) => {
  return (
    <div className="relative">
      {prefixIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {prefixIcon}
        </div>
      )}
      <input
        {...props}
        className={`${className} ${
          prefixIcon ? "pl-10" : "pl-3"
        } py-2 border rounded`}
      />
    </div>
  );
};
