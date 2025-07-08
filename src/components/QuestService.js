///////////////////////////////////////////////// QuestService.js
import { questData, factionColors } from "./questData";
import toast from 'react-hot-toast';

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
      // Desaninha se houver aninhamento indevido
      while (data.missions && data.missions.missions) {
        data.missions = data.missions.missions;
      }
      // Se as facções ou tipos estiverem vazios, use os valores iniciais
      if (!data.factions || data.factions.length === 0) {
        data.factions = initialFactions;
      }
      if (!data.types || data.types.length === 0) {
        data.types = initialTypes;
      }
      return data;
    }
  } catch (e) {
    console.error(e);
    toast.error('Erro ao carregar dados das quests!');
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
    toast.error('Erro ao salvar dados das quests!');
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
    toast.error("Erro ao exportar: " + e.message);
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
      // Salva os dados importados automaticamente
      saveData(data.missions, data.factions, data.types);
    } catch (err) {
      toast.error("Erro na importação: " + err.message);
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
  // Calcula os níveis de profundidade
  const depths = new Map();
  const childrenLinks = new Map();

  const calculateDepth = (id) => {
    if (depths.has(id)) return depths.get(id);
    const mission = missions[id];
    if (!mission || !mission.requires || mission.requires.length === 0) {
      depths.set(id, 0);
      return 0;
    }
    const parentDepths = mission.requires.map(calculateDepth);
    const depth = Math.max(...parentDepths) + 1;
    depths.set(id, depth);
    mission.requires.forEach((parentId) => {
      if (!childrenLinks.has(parentId)) childrenLinks.set(parentId, new Set());
      childrenLinks.get(parentId).add(id);
    });
    return depth;
  };

  Object.keys(missions).forEach(calculateDepth);

  const levelGroups = {};
  depths.forEach((depth, id) => {
    levelGroups[depth] = levelGroups[depth] || [];
    levelGroups[depth].push(id);
  });

  const VERTICAL_SPACING = 180;
  const MIN_NODE_SPACING = 260;
  const positions = {};
  const maxDepth = Math.max(...Object.keys(levelGroups).map(Number));

  const getDescendants = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    const children = Array.from(childrenLinks.get(nodeId) || []);
    let descendants = [...children];
    children.forEach((childId) => {
      descendants = descendants.concat(getDescendants(childId, visited));
    });
    return descendants;
  };

  for (let depth = 0; depth <= maxDepth; depth++) {
    const nodesAtLevel = levelGroups[depth] || [];
    if (depth === 0) {
      const totalWidth = (nodesAtLevel.length - 1) * MIN_NODE_SPACING;
      const startX = -totalWidth / 2;
      nodesAtLevel.sort(
        (a, b) => getDescendants(b).length - getDescendants(a).length
      );
      nodesAtLevel.forEach((id, index) => {
        positions[id] = {
          x: startX + index * MIN_NODE_SPACING,
          y: depth * VERTICAL_SPACING,
        };
      });
      continue;
    }

    const nodePositions = nodesAtLevel.map((id) => {
      const parents = missions[id].requires || [];
      const parentPositions = parents
        .map((pid) => positions[pid])
        .filter((pos) => pos !== undefined);
      const avgX = parentPositions.length
        ? parentPositions.reduce((sum, pos) => sum + pos.x, 0) /
          parentPositions.length
        : 0;
      return { id, x: avgX, weight: getDescendants(id).length + 1 };
    });

    nodePositions.sort((a, b) => a.x - b.x);
    let prevX = nodePositions[0].x;
    for (let i = 1; i < nodePositions.length; i++) {
      const minX = prevX + MIN_NODE_SPACING;
      if (nodePositions[i].x < minX) nodePositions[i].x = minX;
      prevX = nodePositions[i].x;
    }
    const levelWidth =
      nodePositions[nodePositions.length - 1].x - nodePositions[0].x;
    const offset = -levelWidth / 2;
    nodePositions.forEach(({ id, x }) => {
      positions[id] = { x: x + offset, y: depth * VERTICAL_SPACING };
    });
  }

  return positions;
};
