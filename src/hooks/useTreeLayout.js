// useTreeLayout.js
import { useMemo } from "react";
import { calculatePositions } from "../controllers/QuestController";

const CARD_WIDTH = 240;
const CARD_HEIGHT = 120;

const createCurvedPath = (start, end) => {
  const deltaY = end.y - start.y;
  const controlY = start.y + deltaY * 0.5;
  const deltaX = end.x - start.x;
  return `M ${start.x} ${start.y}
          C ${start.x + deltaX * 0.2} ${controlY},
            ${end.x - deltaX * 0.2} ${controlY},
            ${end.x} ${end.y}`;
};

export default function useTreeLayout(
  missions,
  zoom,
  pan,
  filter = "",
  factionColors = {}
) {
  /**
   * 1) Filtra missões
   * 2) Calcula posições (calculatePositions)
   * 3) Monta array de conexões
   *
   * Tudo dentro de um único useMemo,
   * retornando { positions, connections, filtered }.
   * Não usamos useState aqui.
   */
  const result = useMemo(() => {
    // Passo 1: Filtrar
    const filtered = Object.entries(missions || {}).reduce((acc, [id, m]) => {
      const lowerFilter = filter.toLowerCase();
      if (
        (m.title || "").toLowerCase().includes(lowerFilter) ||
        (m.faction || "").toLowerCase().includes(lowerFilter)
      ) {
        acc[id] = m;
      }
      return acc;
    }, {});

    // Passo 2: Calcular posições para as missões filtradas
    const positions = calculatePositions(filtered);

    // Passo 3: Criar lista de conexões (edges) para cada unlock
    const connections = [];
    for (const [id, quest] of Object.entries(filtered)) {
      (quest.unlocks || []).forEach((targetId) => {
        if (!filtered[targetId]) return; // só conecta se ambos estiverem filtrados
        const start = positions[id];
        const end = positions[targetId];
        if (!start || !end) return;

        const startPoint = {
          x: (start.x + CARD_WIDTH / 2) * zoom + pan.x,
          y: (start.y + CARD_HEIGHT) * zoom + pan.y,
        };
        const endPoint = {
          x: (end.x + CARD_WIDTH / 2) * zoom + pan.x,
          y: end.y * zoom + pan.y,
        };

        connections.push({
          id: `${id}-${targetId}`,
          path: createCurvedPath(startPoint, endPoint),
          from: id,
          to: targetId,
          color: factionColors[quest.faction] || "#000",
        });
      });
    }

    // Retorna tudo junto
    return { positions, connections, filtered };
  }, [missions, zoom, pan, filter, factionColors]);

  // Agora é só retornar result
  return result;
}
