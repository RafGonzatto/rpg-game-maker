import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Home,
  Plus,
  Trash2,
  Link,
} from "lucide-react";
import { Card } from "./ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { questData, factionColors } from "./questData";
import NewQuestForm from "./NewQuestForm";

// Constants
const CARD_WIDTH = 240;
const CARD_HEIGHT = 120;
const LEVEL_HEIGHT = 180;
const SIBLING_SPACING = 260;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

const factionSvgColors = {
  "Gangue Rival": "#ef4444",
  Negócios: "#3b82f6",
  Combate: "#10b981",
  Tutorial: "#f59e0b",
  Diplomacia: "#6366f1",
  Aliados: "#8b5cf6",
};

// Helper functions
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

const calculateXPositions = (missions, levels) => {
  const levelGroups = {};
  Object.entries(levels).forEach(([id, level]) => {
    if (!missions[id]) return; // ignora missões inexistentes
    levelGroups[level] = [...(levelGroups[level] || []), id];
  });

  const positions = {};
  Object.entries(levelGroups).forEach(([level, ids]) => {
    const totalWidth = (ids.length - 1) * SIBLING_SPACING;
    const startX = -totalWidth / 2;
    ids.sort(
      (a, b) =>
        missions[b].unlocks.length +
        missions[b].requires.length -
        (missions[a].unlocks.length + missions[a].requires.length)
    );
    ids.forEach((id, index) => {
      positions[id] = {
        x: startX + index * SIBLING_SPACING,
        y: level * LEVEL_HEIGHT,
      };
    });
  });
  return positions;
};

const createCurvedPath = (start, end) => {
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
};

// Custom hooks
function useTreeLayout(missions, zoom, pan, filter = "") {
  const [treePositions, setTreePositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState(missions);

  useEffect(() => {
    const filtered = Object.entries(missions).reduce((acc, [id, mission]) => {
      if (
        mission.title.toLowerCase().includes(filter.toLowerCase()) ||
        mission.faction.toLowerCase().includes(filter.toLowerCase())
      ) {
        acc[id] = mission;
      }
      return acc;
    }, {});
    setFilteredMissions(filtered);
  }, [missions, filter]);

  useEffect(() => {
    const levels = calculateLevels(filteredMissions);
    const positions = calculateXPositions(filteredMissions, levels);
    setTreePositions(positions);

    const newConnections = [];
    Object.entries(filteredMissions).forEach(([id, quest]) => {
      quest.unlocks.forEach((targetId) => {
        if (!filteredMissions[targetId]) return;
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
          color: factionSvgColors[quest.faction] || "#000",
        });
      });
    });
    setConnections(newConnections);
  }, [filteredMissions, zoom, pan]);

  return { positions: treePositions, connections, filteredMissions };
}

// Components
const QuestNode = React.memo(
  ({ quest, selected, onClick, pos, onStartConnect, onRequestDelete }) => (
    <div
      className={`absolute p-4 rounded-lg border-2 shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
        factionColors[quest.faction]
      } ${selected ? "ring-4 ring-purple-500 scale-105" : ""}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: CARD_WIDTH,
        backgroundColor: "white",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(quest.id);
      }}
    >
      <h3 className="font-bold text-sm mb-2 truncate">{quest.title}</h3>
      <div className="flex flex-col gap-1">
        <span className="text-xs px-2 py-1 rounded bg-gray-100">
          Tipo: {quest.type}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-gray-100">
          Facção: {quest.faction}
        </span>
      </div>
      {selected && (
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConnect(quest.id);
                  }}
                >
                  <Link size={16} />
                </div>
              </TooltipTrigger>

              <TooltipContent>Conectar missão</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <div
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(quest.id);
                  }}
                >
                  <Trash2 size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Excluir missão</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
);

const QuestDetails = ({ id, missions }) => {
  const quest = missions[id];
  if (!quest) return null;

  return (
    <Card className="p-4 bg-white shadow-lg">
      <h2 className="font-bold text-xl mb-4 border-b pb-2">{quest.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-700">Facção</p>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              factionColors[quest.faction]
            }`}
          >
            {quest.faction}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Tipo</p>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {quest.type}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-gray-700 mb-2">Requer</p>
        <div className="bg-gray-50 p-3 rounded">
          {quest.requires.length ? (
            <ul className="space-y-1">
              {quest.requires.map((r) => (
                <li key={r} className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {missions[r]?.title || r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhum requisito</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-gray-700 mb-2">Desbloqueia</p>
        <div className="bg-gray-50 p-3 rounded">
          {quest.unlocks.length ? (
            <ul className="space-y-1">
              {quest.unlocks.map((u) => (
                <li key={u} className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {missions[u]?.title || u}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhum desbloqueio</p>
          )}
        </div>
      </div>

      {quest.reputation && Object.keys(quest.reputation).length > 0 && (
        <div className="mt-4">
          <p className="font-semibold text-gray-700 mb-2">Reputação</p>
          <div className="bg-gray-50 p-3 rounded">
            <ul className="space-y-1">
              {Object.entries(quest.reputation).map(([f, v]) => (
                <li
                  key={f}
                  className="text-sm flex items-center justify-between"
                >
                  <span>{f}</span>
                  <span className={v > 0 ? "text-green-500" : "text-red-500"}>
                    {v > 0 ? `+${v}` : v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

const Controls = ({ onZoomIn, onZoomOut, onReset }) => (
  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
    <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              className="w-8 h-8"
            >
              <ZoomIn size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Aumentar zoom</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              className="w-8 h-8"
            >
              <ZoomOut size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diminuir zoom</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="w-8 h-8"
            >
              <Home size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Resetar visualização</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

// Main component
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
  const [filter, setFilter] = useState("");
  const startRef = useRef({ x: 0, y: 0 });

  const { positions, connections, filteredMissions } = useTreeLayout(
    missions,
    zoom,
    pan,
    filter
  );

  // Pan and zoom handlers
  const handlePanStart = (e) => {
    if (e.button !== 0) return; // Only left click
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

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2));

  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2));

  const handleReset = () => {
    setZoom(1);
    setPan({ x: window.innerWidth / 3, y: 50 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * (1 + delta)));
    setZoom(newZoom);
  };

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handlePanEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, []);
  const sectionRef = useRef(null);

  useEffect(() => {
    const sec = sectionRef.current;
    sec?.addEventListener("wheel", handleWheel, { passive: false });
    return () => sec?.removeEventListener("wheel", handleWheel);
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
        alert("Isto geraria um loop de dependências!");
        setConnecting(null);
        return;
      }
      const newM = { ...missions };
      if (!newM[connecting].unlocks.includes(id)) {
        newM[connecting].unlocks.push(id);
        newM[id].requires.push(connecting);
      }
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
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Visualizador de Missões
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                type="text"
                placeholder="Filtrar missões..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

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
              onClick={() =>
                document.getElementById("file-input-nodes").click()
              }
            >
              Importar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {questData.factions.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm"
              >
                <div className={`w-3 h-3 rounded-full ${factionColors[f]}`} />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-[70%_30%] gap-4 p-4 overflow-hidden">
        <section
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
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
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>
              {connections.map((conn) => (
                <path
                  key={conn.id}
                  d={conn.path}
                  stroke={conn.color}
                  strokeWidth={selectedQuest === conn.from ? 3 : 2}
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="transition-all"
                />
              ))}
              {connecting && (
                <path
                  d={buildTempConnection()}
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5,5"
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
              {Object.entries(filteredMissions).map(
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

          <Controls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />

          <div className="h-[20%] overflow-auto p-4 border-t">
            {selectedQuest && (
              <QuestDetails id={selectedQuest} missions={missions} />
            )}
          </div>
        </section>

        <aside className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold">Nova Missão</h2>
          </div>
          <NewQuestForm
            onSave={onAddQuest}
            missions={missions}
            factions={questData.factions}
          />
        </aside>
      </main>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta missão? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
