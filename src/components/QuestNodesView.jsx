import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { questData, factionColors } from "./questData";
import NewQuestForm from "./NewQuestForm";
import { Card } from "./ui/Card";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 92;
const LEVEL_HEIGHT = 150;
const SIBLING_SPACING = 220;

// Mapeamento de cores para as linhas SVG – ajuste os valores conforme necessário
const factionSvgColors = {
  "Gangue Rival": "#f87171",
  Negócios: "#60a5fa",
  Combate: "#34d399",
  Tutorial: "#f87171",
  Diplomacia: "#60a5fa",
  Aliados: "#34d399",
  // adicione outras facções, se necessário
};
// Calcula os níveis hierárquicos de cada missão
const calculateLevels = (missions) => {
  const levels = {};
  const visited = new Set();

  const findLevel = (id, currentLevel = 0) => {
    if (visited.has(id)) return;
    visited.add(id);
    levels[id] = Math.max(currentLevel, levels[id] || 0);
    const quest = missions[id];
    if (!quest) return;
    quest.unlocks.forEach((childId) => {
      findLevel(childId, levels[id] + 1);
    });
  };

  Object.entries(missions).forEach(([id, quest]) => {
    if (quest.requires.length === 0) findLevel(id);
  });
  Object.keys(missions).forEach((id) => {
    if (!visited.has(id)) findLevel(id);
  });
  return levels;
};

// Calcula a posição x para os nós de cada nível
const calculateXPositions = (missions, levels) => {
  const levelGroups = {};
  Object.entries(levels).forEach(([id, level]) => {
    if (!levelGroups[level]) levelGroups[level] = [];
    levelGroups[level].push(id);
  });
  const positions = {};
  Object.entries(levelGroups).forEach(([level, ids]) => {
    const totalWidth = (ids.length - 1) * SIBLING_SPACING;
    const startX = -totalWidth / 2;
    ids.forEach((id, index) => {
      positions[id] = {
        x: startX + index * SIBLING_SPACING,
        y: level * LEVEL_HEIGHT,
      };
    });
  });
  return positions;
};

// Gera uma curva suave entre dois pontos
const createCurvedPath = (start, end) => {
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
};

function useTreeLayout(missions, zoom, pan) {
  const [treePositions, setTreePositions] = useState({});
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const levels = calculateLevels(missions);
    const positions = calculateXPositions(missions, levels);
    setTreePositions(positions);

    const newConnections = [];
    Object.entries(missions).forEach(([id, quest]) => {
      quest.unlocks.forEach((targetId) => {
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
        newConnections.push({
          id: `${id}-${targetId}`,
          path: createCurvedPath(startPoint, endPoint),
          from: id,
          to: targetId,
          color: factionSvgColors[missions[id].faction] || "#000",
        });
      });
    });
    setConnections(newConnections);
  }, [missions, zoom, pan]);

  return { positions: treePositions, connections };
}

const QuestNode = ({
  quest,
  selected,
  onClick,
  pos,
  onStartConnect,
  onRequestDelete,
}) => (
  <div
    className={`absolute p-4 rounded-lg border-2 cursor-pointer transition-all ${
      factionColors[quest.faction]
    } ${selected ? "ring-2 ring-purple-500 transform scale-105" : ""}`}
    style={{ left: pos.x, top: pos.y, width: CARD_WIDTH }}
    onClick={(e) => {
      e.stopPropagation();
      onClick(quest.id);
    }}
  >
    <h3 className="font-bold text-sm mb-1">{quest.title}</h3>
    <p className="text-xs text-gray-600">Tipo: {quest.type}</p>
    <p className="text-xs text-gray-600">Facção: {quest.faction}</p>
    {selected && (
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onStartConnect(quest.id);
          }}
        >
          +
        </button>
        <button
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(quest.id);
          }}
        >
          🗑
        </button>
      </div>
    )}
  </div>
);

const QuestDetails = ({ id, missions }) => {
  const quest = missions[id];
  if (!quest) return null;
  return (
    <Card className="p-4 mt-4">
      <h2 className="font-bold text-lg mb-2">{quest.title}</h2>
      <p>
        <strong>Facção:</strong> {quest.faction}
      </p>
      <p>
        <strong>Tipo:</strong> {quest.type}
      </p>
      <div>
        <p className="font-semibold">Requer:</p>
        <ul className="list-disc pl-5">
          {quest.requires.length ? (
            quest.requires.map((r) => (
              <li key={r} className="text-sm">
                {missions[r]?.title || r}
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhum</li>
          )}
        </ul>
      </div>
      <div>
        <p className="font-semibold">Desbloqueia:</p>
        <ul className="list-disc pl-5">
          {quest.unlocks.length ? (
            quest.unlocks.map((u) => (
              <li key={u} className="text-sm">
                {missions[u]?.title || u}
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhum</li>
          )}
        </ul>
      </div>
      <div>
        <p className="font-semibold">Reputação:</p>
        <ul className="list-disc pl-5">
          {Object.entries(quest.reputation || {}).map(([f, v]) => (
            <li key={f} className="text-sm">
              {f}: {v > 0 ? `+${v}` : v}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default function QuestNodesView({
  missions,
  setMissions,
  selectedQuest,
  setSelectedQuest,
  onExport,
  onImport,
  onAddQuest,
}) {
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: window.innerWidth / 3, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  const { positions, connections } = useTreeLayout(missions, zoom, pan);

  const handlePanStart = (e) => {
    setIsPanning(true);
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startRef.current.x,
      dy = e.clientY - startRef.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanEnd = () => setIsPanning(false);
  const handleZoomIn = () => setZoom((z) => z * 1.1);
  const handleZoomOut = () => setZoom((z) => z / 1.1);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handlePanEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, []);

  const hasPath = (m, from, to, visited = new Set()) => {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    return m[from]?.unlocks?.some((next) => hasPath(m, next, to, visited));
  };

  const handleQuestClick = (id) => {
    if (connecting && connecting !== id) {
      if (hasPath(missions, id, connecting)) {
        alert("Isto geraria loop de dependências!");
        setConnecting(null);
        return;
      }
      const newM = { ...missions };
      if (!newM[connecting].unlocks.includes(id))
        newM[connecting].unlocks.push(id);
      if (!newM[id].requires.includes(connecting))
        newM[id].requires.push(connecting);
      setMissions(newM);
      setConnecting(null);
    } else if (connecting === id) {
      setConnecting(null);
    } else {
      setSelectedQuest(id);
    }
  };

  const handleStartConnect = (id) => setConnecting(id);
  const handleDeleteRequest = (id) => setDeleteId(id);
  const handleDeleteConfirm = () => {
    const newM = { ...missions };
    Object.values(newM).forEach((q) => {
      q.requires = q.requires.filter((r) => r !== deleteId);
      q.unlocks = q.unlocks.filter((u) => u !== deleteId);
    });
    delete newM[deleteId];
    setMissions(newM);
    setDeleteId(null);
    if (selectedQuest === deleteId) setSelectedQuest(null);
  };

  const buildTempConnection = () => {
    if (!connecting || !positions[connecting]) return "";
    const sx = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x,
      sy = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y,
      ex = mousePos.x,
      ey = mousePos.y;
    return `M ${sx} ${sy} L ${ex} ${ey}`;
  };

  return (
    <div className="h-screen grid grid-rows-[10vh_90vh]">
      <header className="flex flex-col md:flex-row justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Visualizador de Missões</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            Exportar
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            id="file-input-nodes"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input-nodes").click()}
          >
            Importar
          </Button>
        </div>
        <div className="flex gap-2">
          {questData.factions.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${factionColors[f]}`}></div>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </header>
      <main className="grid grid-cols-[70%_30%] h-full">
        <section
          className="border rounded-lg overflow-hidden relative"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onClick={() => {
            if (connecting) setConnecting(null);
          }}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
        >
          <div className="relative h-[80%] w-full overflow-hidden">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead-parent"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
                <marker
                  id="arrowhead-child"
                  markerWidth="10"
                  markerHeight="7"
                  refX="0"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="10 0, 0 3.5, 10 7" fill="currentColor" />
                </marker>
              </defs>
              {connections.map((conn) => {
                const isSelected = selectedQuest === conn.from;
                return (
                  <path
                    key={conn.id}
                    d={conn.path}
                    stroke="currentColor"
                    strokeWidth={isSelected ? 4 : 2}
                    fill="none"
                    markerStart="url(#arrowhead-parent)"
                    markerEnd="url(#arrowhead-child)"
                    style={{ color: conn.color }}
                  />
                );
              })}
              {connecting && (
                <path
                  d={buildTempConnection()}
                  stroke="#999"
                  strokeWidth={2}
                  fill="none"
                />
              )}
            </svg>
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {Object.entries(missions).map(
                ([id, quest]) =>
                  positions[id] && (
                    <QuestNode
                      key={id}
                      quest={quest}
                      selected={selectedQuest === id}
                      onClick={handleQuestClick}
                      pos={positions[id]}
                      onStartConnect={handleStartConnect}
                      onRequestDelete={handleDeleteRequest}
                    />
                  )
              )}
            </div>
          </div>
          <div className="h-[20%] overflow-auto p-2 bg-gray-100">
            {selectedQuest && (
              <QuestDetails id={selectedQuest} missions={missions} />
            )}
          </div>
        </section>
        <aside className="p-4 overflow-auto">
          <h2 className="text-lg font-bold mb-2">Nova Missão</h2>
          <NewQuestForm
            onSave={onAddQuest}
            missions={missions}
            factions={questData.factions}
          />
        </aside>
      </main>
      {deleteId && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md">
            <p className="mb-4">Tem certeza que deseja excluir?</p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Excluir
              </Button>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
