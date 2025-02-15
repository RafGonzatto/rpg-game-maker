import { useState, useEffect } from "react";
import { calculatePositions } from "../controllers/QuestController";

const CARD_WIDTH = 240,
  CARD_HEIGHT = 120;

const createCurvedPath = (start, end) => {
  const deltaY = end.y - start.y,
    controlY = start.y + deltaY * 0.5,
    deltaX = end.x - start.x;
  return `M ${start.x} ${start.y} C ${start.x + deltaX * 0.2} ${controlY}, ${
    end.x - deltaX * 0.2
  } ${controlY}, ${end.x} ${end.y}`;
};

export default function useTreeLayout(
  missions,
  zoom,
  pan,
  filter = "",
  factionColors = {}
) {
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [filtered, setFiltered] = useState(missions);

  useEffect(() => {
    const f = Object.entries(missions || {}).reduce((acc, [id, m]) => {
      if (
        (m.title || "").toLowerCase().includes(filter.toLowerCase()) ||
        (m.faction || "").toLowerCase().includes(filter.toLowerCase())
      )
        acc[id] = m;
      return acc;
    }, {});
    setFiltered(f);
  }, [missions, filter]);

  useEffect(() => {
    const pos = calculatePositions(filtered);
    setPositions(pos);
    const conns = [];
    Object.entries(filtered).forEach(([id, quest]) => {
      (quest.unlocks || []).forEach((targetId) => {
        if (!filtered[targetId]) return;
        const start = pos[id],
          end = pos[targetId];
        if (!start || !end) return;
        const startPoint = {
            x: (start.x + CARD_WIDTH / 2) * zoom + pan.x,
            y: (start.y + CARD_HEIGHT) * zoom + pan.y,
          },
          endPoint = {
            x: (end.x + CARD_WIDTH / 2) * zoom + pan.x,
            y: end.y * zoom + pan.y,
          };
        conns.push({
          id: `${id}-${targetId}`,
          path: createCurvedPath(startPoint, endPoint),
          from: id,
          to: targetId,
          color: factionColors[quest.faction] || "#000",
        });
      });
    });
    setConnections(conns);
  }, [filtered, zoom, pan, factionColors]);

  return { positions, connections, filtered };
}
