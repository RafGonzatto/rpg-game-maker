import React, { useState, useEffect } from "react";

const ResizableLayout = ({ children }) => {
  const [verticalDividerPosition, setVerticalDividerPosition] = useState(70);
  const [horizontalDividerPosition, setHorizontalDividerPosition] =
    useState(60);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingVertical) {
        const container = document.getElementById("main-container");
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const newPosition =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setVerticalDividerPosition(Math.min(Math.max(newPosition, 20), 80));
      }
      if (isDraggingHorizontal) {
        const container = document.getElementById("left-container");
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const newPosition =
          ((e.clientY - containerRect.top) / containerRect.height) * 100;
        setHorizontalDividerPosition(Math.min(Math.max(newPosition, 20), 80));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVertical(false);
      setIsDraggingHorizontal(false);
    };

    if (isDraggingVertical || isDraggingHorizontal) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingVertical, isDraggingHorizontal]);

  return (
    <div
      id="main-container"
      className="flex-1 grid gap-4 p-4 overflow-hidden"
      style={{
        height: "100%",
        gridTemplateColumns: `${verticalDividerPosition}% ${
          100 - verticalDividerPosition
        }%`,
      }}
    >
      <div
        id="left-container"
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ height: "100%" }}
      >
        <div
          style={{ height: `${horizontalDividerPosition}%` }}
          className="relative w-full overflow-hidden"
        >
          {children[0]}
        </div>

        {/* Horizontal Divider */}
        <div
          className="absolute w-full h-1 bg-transparent cursor-row-resize group hover:bg-gray-200 transition-colors"
          style={{
            top: `${horizontalDividerPosition}%`,
            transform: "translateY(-50%)",
          }}
          onMouseDown={() => setIsDraggingHorizontal(true)}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          style={{ height: `${100 - horizontalDividerPosition}%` }}
          className="overflow-auto p-4 border-t"
        >
          {children[1]}
        </div>
      </div>

      {/* Vertical Divider */}
      <div
        className="absolute h-full w-1 bg-transparent cursor-col-resize group hover:bg-gray-200 transition-colors"
        style={{
          left: `${verticalDividerPosition}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={() => setIsDraggingVertical(true)}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-4 bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <aside className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
        {children[2]}
      </aside>
    </div>
  );
};

export default ResizableLayout;
