import React, { useState, useEffect } from "react";

const COLORS = {
  divider: "bg-red-500",
  dividerHover: "hover:bg-red-500",
  corner: "bg-red-500",
  containerBg: "bg-white",
};

const ResizableLayout = ({
  children,
  verticalDividerPosition,
  horizontalDividerPosition,
  onVerticalDividerChange,
  onHorizontalDividerChange,
}) => {
  const [isDragging, setIsDragging] = useState({
    vertical: false,
    horizontal: false,
    corner: false,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.getElementById("main-container");
      if (!container) return;
      const { left, top, width, height } = container.getBoundingClientRect();

      if (isDragging.vertical || isDragging.corner) {
        const newVertical = ((e.clientX - left) / width) * 100;
        onVerticalDividerChange(Math.min(Math.max(newVertical, 2), 98));
      }
      if (isDragging.horizontal || isDragging.corner) {
        const newHorizontal = ((e.clientY - top) / height) * 100;
        onHorizontalDividerChange(Math.min(Math.max(newHorizontal, 2), 97));
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
  }, [isDragging, onVerticalDividerChange, onHorizontalDividerChange]);

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
      <div
        style={cornerStyle}
        onMouseDown={() => setIsDragging((prev) => ({ ...prev, corner: true }))}
        className="group"
      >
        <div
          className={`w-8 h-8 ${COLORS.corner} rounded-full translate-x-[-20%] translate-y-[-30%] opacity-0 group-hover:opacity-100 transition-opacity`}
        />
      </div>

      <div
        id="left-container"
        className={`relative ${COLORS.containerBg} rounded-lg shadow-lg overflow-hidden`}
        style={{ height: "100%", gridColumn: "1 / 2" }}
      >
        <div
          style={{ height: `${horizontalDividerPosition}%` }}
          className="relative w-full overflow-hidden"
        >
          {children[0]}
        </div>
        <div
          className={`absolute w-full h-3 cursor-row-resize rounded group transition-colors ${
            isDragging.horizontal || isDragging.corner
              ? COLORS.divider
              : `bg-transparent ${COLORS.dividerHover}`
          }`}
          style={{
            top: `${horizontalDividerPosition}%`,
            transform: "translateY(-50%)",
          }}
          onMouseDown={() =>
            setIsDragging((prev) => ({ ...prev, horizontal: true }))
          }
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-6 rounded group-hover:opacity-100 transition-opacity" />
        </div>
        <div
          style={{ height: `${100 - horizontalDividerPosition}%` }}
          className="overflow-auto p-4 border-t"
        >
          {children[1]}
        </div>
      </div>

      <div
        className={`absolute h-full w-3 cursor-col-resize rounded group transition-colors ${
          isDragging.vertical || isDragging.corner
            ? COLORS.divider
            : `bg-transparent ${COLORS.dividerHover}`
        }`}
        style={{
          left: `${verticalDividerPosition}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={() =>
          setIsDragging((prev) => ({ ...prev, vertical: true }))
        }
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-6 rounded group-hover:opacity-100 transition-opacity" />
      </div>

      <aside
        className={`${COLORS.containerBg} rounded-lg shadow-lg p-4 overflow-auto`}
        style={{ gridColumn: "2 / 3", height: "100%" }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
      >
        {children[2]}
      </aside>

      <div
        style={cornerStyle}
        onMouseDown={() => setIsDragging((prev) => ({ ...prev, corner: true }))}
      />
    </div>
  );
};

export default ResizableLayout;
