//////////////////////////////controllers/QuestService.js
import { questData } from "../components/questData";

const initialFactions = [
  { name: "Gangue Rival", bgColor: "#ef4444", borderColor: "#b91c1c" },
  { name: "Negócios", bgColor: "#3b82f6", borderColor: "#1e40af" },
  { name: "Combate", bgColor: "#10b981", borderColor: "#047857" },
  { name: "Tutorial", bgColor: "#f59e0b", borderColor: "#d97706" },
  { name: "Diplomacia", bgColor: "#6366f1", borderColor: "#4f46e5" },
  { name: "Aliados", bgColor: "#8b5cf6", borderColor: "#7c3aed" },
];
const initialTypes = [
  "Cutscene",
  "Diálogo",
  "Batalha",
  "Negociação",
  "Recrutamento",
  "Acordo",
];

export const getInitialData = () => {
  try {
    const saved = localStorage.getItem("questData");
    if (saved) {
      let data = JSON.parse(saved);
      while (data.missions && data.missions.missions) {
        data.missions = data.missions.missions;
      }
      data.factions = data.factions?.length ? data.factions : initialFactions;
      data.types = data.types?.length ? data.types : initialTypes;
      return data;
    }
  } catch (e) {
    console.error(e);
  }
  const initialData = {
    missions: questData.missions,
    factions: initialFactions,
    types: initialTypes,
  };
  saveData(initialData.missions, initialData.factions, initialData.types);
  return initialData;
};

export const saveData = (missions, factions, types) => {
  try {
    localStorage.setItem(
      "questData",
      JSON.stringify({ missions, factions, types })
    );
  } catch (e) {
    console.error(e);
  }
};

export const exportData = (missions, factions, types) => {
  try {
    const blob = new Blob([JSON.stringify({ missions, factions, types })], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quest_data_${new Date().toISOString()}.json`;
    a.click();
  } catch (e) {
    alert("Erro ao exportar: " + e.message);
  }
};

export const importData = (e, setMissions, setFactions, setTypes) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.missions || !data.factions || !data.types)
        throw new Error("Arquivo inválido");
      setMissions(data.missions);
      setFactions(data.factions);
      setTypes(data.types);
      saveData(data.missions, data.factions, data.types);
    } catch (err) {
      alert("Erro na importação: " + err.message);
    }
  };
  reader.readAsText(file);
};

export const addQuest = (prev, quest) => {
  const updated = { ...prev };
  quest.requires.forEach((pid) => {
    if (updated[pid]) {
      updated[pid] = {
        ...updated[pid],
        unlocks: [...new Set([...(updated[pid].unlocks || []), quest.id])],
      };
    }
  });
  return { ...updated, [quest.id]: quest };
};

export const calculatePositions = (missions) => {
  const depths = new Map(),
    childrenLinks = new Map();

  const calcDepth = (id) => {
    if (depths.has(id)) return depths.get(id);
    const mission = missions[id];
    if (!mission?.requires?.length) {
      depths.set(id, 0);
      return 0;
    }
    const parentDepths = mission.requires.map(calcDepth);
    const depth = Math.max(...parentDepths) + 1;
    depths.set(id, depth);
    mission.requires.forEach((pid) => {
      if (!childrenLinks.has(pid)) childrenLinks.set(pid, new Set());
      childrenLinks.get(pid).add(id);
    });
    return depth;
  };

  Object.keys(missions).forEach(calcDepth);
  const levelGroups = {};
  depths.forEach((d, id) => (levelGroups[d] = [...(levelGroups[d] || []), id]));

  const VERTICAL = 180,
    MIN_NODE = 260,
    positions = {},
    maxDepth = Math.max(...Object.keys(levelGroups).map(Number));

  const getDescendants = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    const children = [...(childrenLinks.get(nodeId) || [])];
    return children.concat(
      children.flatMap((child) => getDescendants(child, visited))
    );
  };

  for (let depth = 0; depth <= maxDepth; depth++) {
    const nodes = levelGroups[depth] || [];
    if (!depth) {
      const startX = -((nodes.length - 1) * MIN_NODE) / 2;
      nodes
        .sort((a, b) => getDescendants(b).length - getDescendants(a).length)
        .forEach(
          (id, i) =>
            (positions[id] = { x: startX + i * MIN_NODE, y: depth * VERTICAL })
        );
      continue;
    }
    const nodePositions = nodes
      .map((id) => {
        const parents = missions[id].requires || [];
        const avgX =
          parents
            .map((pid) => positions[pid]?.x || 0)
            .reduce((a, b) => a + b, 0) / parents.length || 0;
        return { id, x: avgX };
      })
      .sort((a, b) => a.x - b.x);
    nodePositions.reduce(
      (prev, cur, i) => (cur.x = i ? Math.max(cur.x, prev + MIN_NODE) : cur.x),
      nodePositions[0]?.x || 0
    );
    const offset =
      -(nodePositions[nodePositions.length - 1].x - nodePositions[0].x) / 2;
    nodePositions.forEach(
      ({ id, x }) => (positions[id] = { x: x + offset, y: depth * VERTICAL })
    );
  }
  return positions;
};
