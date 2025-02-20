//views/QuestVisualizer.jsx
import React, { useState, useEffect } from "react";
import QuestNodesView from "./QuestNodesView";
import QuestGraphView from "./QuestGraphView";
import {
  getInitialData,
  saveData,
  exportData,
  importData,
  addQuest,
  calculatePositions,
} from "../components/QuestService";

export default function QuestVisualizer() {
  const initialData = getInitialData();
  const [missions, setMissions] = useState(initialData.missions);
  const [factions, setFactions] = useState(initialData.factions);
  const [types, setTypes] = useState(initialData.types);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const positions = calculatePositions(missions);
  const [view, setView] = useState("nodes");

  useEffect(() => {
    saveData(missions, factions, types);
  }, [missions, factions, types]);

  return (
    <div>
      {view === "nodes" ? (
        <QuestNodesView
          missions={missions}
          setMissions={setMissions}
          setView={setView}
          selectedQuest={selectedQuest}
          setSelectedQuest={setSelectedQuest}
          onExport={() => exportData(missions, factions, types)}
          onImport={(e) => importData(e, setMissions, setFactions, setTypes)}
          onAddQuest={(q) => setMissions((prev) => addQuest(prev, q))}
          positions={positions}
          factions={factions}
          setFactions={setFactions}
          types={types}
          setTypes={setTypes}
        />
      ) : (
        <QuestGraphView
          missions={missions}
          setMissions={setMissions}
          selectedQuest={selectedQuest}
          setSelectedQuest={setSelectedQuest}
          onExport={() => exportData(missions, factions, types)}
          onImport={(e) => importData(e, setMissions, setFactions, setTypes)}
          onAddQuest={(q) => setMissions((prev) => addQuest(prev, q))}
        />
      )}
    </div>
  );
}
