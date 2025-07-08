// Input.js
import React, { forwardRef } from "react";

export const Input = forwardRef(({ prefixIcon, ...props }, ref) => (
  <div className="relative">
    {prefixIcon && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2">
        {prefixIcon}
      </span>
    )}
    <input
      {...props}
      ref={ref}
      className={`pl-10 bg-amber-50 ${props.className}`}
      onFocus={(e) => e.target.select()}
    />
  </div>
));

Input.displayName = "Input";
