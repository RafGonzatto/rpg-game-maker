import React, { useState } from "react";
import QuestNodesView from "./QuestNodesView";
import QuestGraphView from "./QuestGraphView";

export default function QuestView({
  missions,
  setMissions,
  selectedQuest,
  setSelectedQuest,
  onExport,
  onImport,
  onAddQuest,
  positions, // usado somente na visualização de nós
}) {
  const [view, setView] = useState("nodes");
  return (
    <div>
      <header className="p-2 flex gap-2">
        <button onClick={() => setView("nodes")}>Visualização de Nós</button>
        <button onClick={() => setView("graph")}>Visualização de Grafó</button>
      </header>
      {view === "nodes" ? (
        <QuestNodesView
          missions={missions}
          setMissions={setMissions}
          selectedQuest={selectedQuest}
          setSelectedQuest={setSelectedQuest}
          onExport={onExport}
          onImport={onImport}
          onAddQuest={onAddQuest}
          positions={positions}
        />
      ) : (
        <QuestGraphView
          missions={missions}
          setMissions={setMissions}
          selectedQuest={selectedQuest}
          setSelectedQuest={setSelectedQuest}
          onExport={onExport}
          onImport={onImport}
          onAddQuest={onAddQuest}
        />
      )}
    </div>
  );
}
