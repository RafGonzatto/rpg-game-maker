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
import useQuestNodesLogic from "../hooks/useQuestNodesLogic";

export default function QuestVisualizer() {
  const initialData = getInitialData();
  const [missions, setMissions] = useState(initialData.missions);
  const [factions, setFactions] = useState(initialData.factions);
  const [types, setTypes] = useState(initialData.types);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [view, setView] = useState("nodes");

  useEffect(() => {
    saveData(missions, factions, types);
  }, [missions, factions, types]);

  const logic = useQuestNodesLogic({
    missions,
    setMissions,
    factions,
    setFactions,
    types,
    setTypes,
    selectedQuest,
    setSelectedQuest,
  });

  const commonProps = {
    missions,
    setMissions,
    selectedQuest,
    setSelectedQuest,
    factions,
    setFactions,
    types,
    onExport: () => exportData(missions, factions, types),
    onImport: (e) => importData(e, setMissions, setFactions, setTypes),
    onAddQuest: (q) => setMissions((prev) => addQuest(prev, q)),
    ...logic,
    factionSvgColors: logic.factionSvgColors,
  };

  commonProps.positions = calculatePositions(missions);

  return view === "nodes" ? (
    <QuestNodesView {...commonProps} />
  ) : (
    <QuestGraphView {...commonProps} />
  );
}
