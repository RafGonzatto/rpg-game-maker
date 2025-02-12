// useForceLayout.js
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from "d3-force";
import { useEffect, useRef, useState } from "react";

export function useForceLayout(nodes = [], links = []) {
  const [positions, setPositions] = useState({});
  const simulation = useRef();

  useEffect(() => {
    if (!nodes.length) return;

    // Exemplo: aumentar .distance para ~250 e deixar o charge mais forte
    simulation.current = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          .distance(400)
      )
      .force("charge", forceManyBody().strength(-400)) // mais negativo = mais repulsão
      .force("center", forceCenter())
      .on("tick", () => {
        const newPositions = {};
        nodes.forEach((n) => {
          newPositions[n.id] = { x: n.x || 0, y: n.y || 0 };
        });
        setPositions(newPositions);
      });

    return () => simulation.current.stop();
  }, [nodes, links]);

  return positions;
}
