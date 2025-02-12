import { questData } from "./questData";

export const getInitialMissions = () => {
  try {
    const saved = localStorage.getItem("questData");
    return saved ? JSON.parse(saved).missions : questData.missions;
  } catch {
    return questData.missions;
  }
};

export const saveMissions = (missions) => {
  try {
    localStorage.setItem(
      "questData",
      JSON.stringify({ missions, factions: questData.factions })
    );
  } catch (e) {
    console.error(e);
  }
};

export const exportData = (missions) => {
  try {
    const blob = new Blob(
      [JSON.stringify({ missions, factions: questData.factions })],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quest_data_${new Date().toISOString()}.json`;
    a.click();
  } catch (e) {
    alert("Erro ao exportar: " + e.message);
  }
};

export const importData = (e, setMissions) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.missions || !data.factions) throw new Error("Arquivo inválido");
      setMissions(data.missions);
    } catch (err) {
      alert("Erro na importação: " + err.message);
    }
  };
  reader.readAsText(file);
};

export const addQuest = (prev, quest) => {
  const updated = { ...prev };
  quest.requires.forEach((pid) => {
    if (updated[pid])
      updated[pid] = {
        ...updated[pid],
        unlocks: [...new Set([...updated[pid].unlocks, quest.id])],
      };
  });
  return { ...updated, [quest.id]: quest };
};
export const calculatePositions = (missions) => {
  // Calculate depth levels first
  const depths = new Map();
  const childrenLinks = new Map();

  const calculateDepth = (id) => {
    if (depths.has(id)) return depths.get(id);
    const mission = missions[id];
    if (!mission || !mission.requires.length) {
      depths.set(id, 0);
      return 0;
    }

    const parentDepths = mission.requires.map(calculateDepth);
    const depth = Math.max(...parentDepths) + 1;
    depths.set(id, depth);

    // Store children relationships
    mission.requires.forEach((parentId) => {
      if (!childrenLinks.has(parentId)) {
        childrenLinks.set(parentId, new Set());
      }
      childrenLinks.get(parentId).add(id);
    });

    return depth;
  };

  // Calculate depths for all nodes
  Object.keys(missions).forEach(calculateDepth);

  // Group nodes by depth level
  const levelGroups = {};
  depths.forEach((depth, id) => {
    if (!levelGroups[depth]) levelGroups[depth] = [];
    levelGroups[depth].push(id);
  });

  // Constants for layout
  const VERTICAL_SPACING = 180;
  const MIN_NODE_SPACING = 260;

  // Calculate positions with parent proximity in mind
  const positions = {};

  // Process levels from top to bottom
  const maxDepth = Math.max(...Object.keys(levelGroups).map(Number));

  // Helper function to get all descendants of a node
  const getDescendants = (nodeId, visited = new Set()) => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const children = Array.from(childrenLinks.get(nodeId) || []);
    const descendants = [...children];

    children.forEach((childId) => {
      descendants.push(...getDescendants(childId, visited));
    });

    return descendants;
  };

  // Position nodes level by level
  for (let depth = 0; depth <= maxDepth; depth++) {
    const nodesAtLevel = levelGroups[depth] || [];

    if (depth === 0) {
      // Position root nodes evenly
      const totalWidth = (nodesAtLevel.length - 1) * MIN_NODE_SPACING;
      const startX = -totalWidth / 2;

      // Sort root nodes by number of descendants
      nodesAtLevel.sort((a, b) => {
        const aDesc = getDescendants(a).length;
        const bDesc = getDescendants(b).length;
        return bDesc - aDesc;
      });

      nodesAtLevel.forEach((id, index) => {
        positions[id] = {
          x: startX + index * MIN_NODE_SPACING,
          y: depth * VERTICAL_SPACING,
        };
      });
      continue;
    }

    // For each node at this level, calculate ideal position based on parents
    const nodePositions = nodesAtLevel.map((id) => {
      const parents = missions[id].requires;
      const parentPositions = parents
        .map((pid) => positions[pid])
        .filter((pos) => pos !== undefined);

      if (parentPositions.length === 0) {
        return {
          id,
          x: 0, // Will be adjusted later
          weight: getDescendants(id).length + 1,
        };
      }

      // Calculate weighted average of parent positions
      const avgX =
        parentPositions.reduce((sum, pos) => sum + pos.x, 0) /
        parentPositions.length;

      return {
        id,
        x: avgX,
        weight: getDescendants(id).length + 1,
      };
    });

    // Sort nodes by their calculated X position
    nodePositions.sort((a, b) => a.x - b.x);

    // Adjust positions to maintain minimum spacing
    let prevX = nodePositions[0].x;
    for (let i = 1; i < nodePositions.length; i++) {
      const minX = prevX + MIN_NODE_SPACING;
      if (nodePositions[i].x < minX) {
        nodePositions[i].x = minX;
      }
      prevX = nodePositions[i].x;
    }

    // Center the level
    const levelWidth =
      nodePositions[nodePositions.length - 1].x - nodePositions[0].x;
    const offset = -levelWidth / 2;

    // Assign final positions
    nodePositions.forEach(({ id, x }) => {
      positions[id] = {
        x: x + offset,
        y: depth * VERTICAL_SPACING,
      };
    });
  }

  return positions;
};
