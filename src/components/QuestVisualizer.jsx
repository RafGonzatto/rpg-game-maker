import React, { useState, useEffect } from "react";
import QuestView from "./QuestView";
import {
  getInitialMissions,
  saveMissions,
  exportData,
  importData,
  addQuest,
  calculatePositions,
} from "./QuestService";

const QuestVisualizer = () => {
  const [missions, setMissions] = useState(getInitialMissions);
  useEffect(() => saveMissions(missions), [missions]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const positions = calculatePositions(missions);

  return (
    <QuestView
      missions={missions}
      positions={positions}
      selectedQuest={selectedQuest}
      setSelectedQuest={setSelectedQuest}
      setMissions={setMissions}
      onExport={() => exportData(missions)}
      onImport={(e) => importData(e, setMissions)}
      onAddQuest={(q) => setMissions((prev) => addQuest(prev, q))}
      onQuestClick={setSelectedQuest}
    />
  );
};
export default QuestVisualizer;
