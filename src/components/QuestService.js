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
  const pos = {},
    depths = new Map();
  const calc = (id) => {
    if (depths.has(id)) return depths.get(id);
    const m = missions[id];
    if (!m || !m.requires.length) return depths.set(id, 0), 0;
    const d = Math.max(...m.requires.map(calc)) + 1;
    depths.set(id, d);
    return d;
  };
  Object.keys(missions).forEach((id) => {
    const d = calc(id);
    pos[d] = pos[d] || [];
    pos[d].push(id);
  });
  const levelPos = {},
    V = 120,
    H = 250;
  Object.entries(pos).forEach(([d, ids]) => {
    const y = parseInt(d) * V + 50,
      startX = (800 - (ids.length - 1) * H) / 2;
    ids.forEach((id, i) => (levelPos[id] = { x: startX + i * H, y }));
  });
  return levelPos;
};
