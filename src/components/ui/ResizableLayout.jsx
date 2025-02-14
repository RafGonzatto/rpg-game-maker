import React, { useState, useEffect } from "react";

const ResizableLayout = ({ children }) => {
  const [verticalDividerPosition, setVerticalDividerPosition] = useState(70);
  const [horizontalDividerPosition, setHorizontalDividerPosition] =
    useState(60);
  const [isDragging, setIsDragging] = useState({
    vertical: false,
    horizontal: false,
    corner: false,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.getElementById("main-container");
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      // Calcular novas posições apenas se estiver arrastando
      if (isDragging.vertical || isDragging.corner) {
        const newVertical =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setVerticalDividerPosition(Math.min(Math.max(newVertical, 20), 80));
      }

      if (isDragging.horizontal || isDragging.corner) {
        const newHorizontal =
          ((e.clientY - containerRect.top) / containerRect.height) * 100;
        setHorizontalDividerPosition(Math.min(Math.max(newHorizontal, 20), 80));
      }
    };

    const handleMouseUp = () =>
      setIsDragging({ vertical: false, horizontal: false, corner: false });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Área de interseção
  const cornerSize = 15;
  const cornerStyle = {
    position: "absolute",
    left: `${verticalDividerPosition}%`,
    top: `${horizontalDividerPosition}%`,
    transform: "translate(-50%, -50%)",
    width: cornerSize,
    height: cornerSize,
    cursor: "nwse-resize",
    zIndex: 20,
  };

  return (
    <div
      id="main-container"
      className="flex-1 grid gap-4 p-4 overflow-hidden"
      style={{
        height: "100%",
        gridTemplateColumns: `${verticalDividerPosition}% ${
          100 - verticalDividerPosition
        }%`,
        position: "relative",
      }}
    >
      {/* Área de redimensionamento do canto */}
      <div
        style={cornerStyle}
        onMouseDown={() => setIsDragging({ ...isDragging, corner: true })}
        className="group"
      >
        <div className="w-full h-full bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Container esquerdo */}
      <div
        id="left-container"
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ height: "100%" }}
      >
        {/* Parte superior */}
        <div
          style={{ height: `${horizontalDividerPosition}%` }}
          className="relative w-full overflow-hidden"
        >
          {children[0]}
        </div>

        {/* Divisor horizontal */}
        <div
          className="absolute w-full h-1 bg-transparent cursor-row-resize group hover:bg-gray-200 transition-colors"
          style={{
            top: `${horizontalDividerPosition}%`,
            transform: "translateY(-50%)",
          }}
          onMouseDown={() => setIsDragging({ ...isDragging, horizontal: true })}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Parte inferior */}
        <div
          style={{ height: `${100 - horizontalDividerPosition}%` }}
          className="overflow-auto p-4 border-t"
        >
          {children[1]}
        </div>
      </div>

      {/* Divisor vertical */}
      <div
        className="absolute h-full w-1 bg-transparent cursor-col-resize group hover:bg-gray-200 transition-colors"
        style={{
          left: `${verticalDividerPosition}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={() => setIsDragging({ ...isDragging, vertical: true })}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-4 bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Aside direito */}
      <aside className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
        {children[2]}
      </aside>
    </div>
  );
};

export default ResizableLayout;
