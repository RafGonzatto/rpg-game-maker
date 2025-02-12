// QuestNodesView.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  calculatePositions,
  getInitialData,
  saveData,
  exportData,
  importData,
} from "./QuestService";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
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
import NewQuestForm from "./NewQuestForm";

const CARD_WIDTH = 240,
  CARD_HEIGHT = 120,
  MIN_ZOOM = 0.5,
  MAX_ZOOM = 2;

const factionSvgColors = {
  "Gangue Rival": "#ef4444",
  Negócios: "#3b82f6",
  Combate: "#10b981",
  Tutorial: "#f59e0b",
  Diplomacia: "#6366f1",
  Aliados: "#8b5cf6",
};

const createCurvedPath = (start, end) => {
  const deltaY = end.y - start.y;
  const controlY = start.y + deltaY * 0.5;
  const deltaX = end.x - start.x;
  return `M ${start.x} ${start.y} C ${start.x + deltaX * 0.2} ${controlY}, ${
    end.x - deltaX * 0.2
  } ${controlY}, ${end.x} ${end.y}`;
};

function useTreeLayout(missions, zoom, pan, filter = "", factionColors = {}) {
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [filtered, setFiltered] = useState(missions);

  useEffect(() => {
    const f = Object.entries(missions || {}).reduce((acc, [id, m]) => {
      if (
        (m.title || "").toLowerCase().includes(filter.toLowerCase()) ||
        (m.faction || "").toLowerCase().includes(filter.toLowerCase())
      )
        acc[id] = m;
      return acc;
    }, {});
    setFiltered(f);
  }, [missions, filter]);

  useEffect(() => {
    const pos = calculatePositions(filtered);
    setPositions(pos);
    const conns = [];
    Object.entries(filtered).forEach(([id, quest]) => {
      (quest.unlocks || []).forEach((targetId) => {
        if (!filtered[targetId]) return;
        const start = pos[id],
          end = pos[targetId];
        if (!start || !end) return;
        const startPoint = {
            x: (start.x + CARD_WIDTH / 2) * zoom + pan.x,
            y: (start.y + CARD_HEIGHT) * zoom + pan.y,
          },
          endPoint = {
            x: (end.x + CARD_WIDTH / 2) * zoom + pan.x,
            y: end.y * zoom + pan.y,
          },
          deltaY = endPoint.y - startPoint.y,
          controlY = startPoint.y + deltaY * 0.5,
          deltaX = endPoint.x - startPoint.x;
        conns.push({
          id: `${id}-${targetId}`,
          path: createCurvedPath(startPoint, endPoint),
          from: id,
          to: targetId,
          color: factionColors[quest.faction] || "#000",
        });
      });
    });
    setConnections(conns);
  }, [filtered, zoom, pan, factionColors]);

  return { positions, connections, filtered };
}

const QuestNode = React.memo(
  ({
    quest,
    selected,
    onClick,
    pos,
    onStartConnect,
    onRequestDelete,
    factionConfig,
  }) => (
    <div
      className={`absolute p-4 rounded-lg border-2 shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
        selected ? "ring-4 ring-purple-500 scale-105" : ""
      }`}
      style={{
        left: pos.x,
        top: pos.y,
        width: CARD_WIDTH,
        minHeight: CARD_HEIGHT + 10,
        backgroundColor: factionConfig?.bgColor || "white",
        borderColor: factionConfig?.borderColor || "#000",
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
        <span
          className="text-xs px-2 py-1 rounded bg-gray-100"
          style={{ backgroundColor: factionSvgColors[quest.faction] || "#fff" }}
        >
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
  const requires = quest.requires || [];
  const unlocks = quest.unlocks || [];
  const reputation = quest.reputation || {};

  return (
    <Card className="p-6 bg-white shadow-none border-2 border-gray-100">
      <h2 className="font-bold text-2xl mb-6 border-b pb-3 text-gray-800">
        {quest.title}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-700">Facção</p>
          <span
            className="px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: factionSvgColors[quest.faction] || "#fff",
            }}
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
          {requires.length ? (
            <ul className="space-y-1">
              {requires.map((r) => (
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
          {unlocks.length ? (
            <ul className="space-y-1">
              {unlocks.map((u) => (
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
      {quest.dialogo && (
        <div className="mt-4">
          <p className="font-semibold text-gray-700 mb-2">Diálogo</p>
          <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
            {quest.dialogo}
          </div>
        </div>
      )}
      {Object.keys(reputation).length > 0 && (
        <div className="mt-4">
          <p className="font-semibold text-gray-700 mb-2">Reputação</p>
          <div className="bg-gray-50 p-3 rounded">
            <ul className="space-y-1">
              {Object.entries(reputation).map(([f, v]) => (
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

export default function QuestNodesView({
  missions,
  setMissions,
  selectedQuest,
  setSelectedQuest,
  onAddQuest,
}) {
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: window.innerWidth / 3, y: 50 });
  const [filter, setFilter] = useState("");
  const startRef = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [factions, setFactions] = useState([]);
  const [types, setTypes] = useState([]);
  const [newFaction, setNewFaction] = useState({
    name: "",
    bgColor: "#ffffff",
    borderColor: "#000000",
  });
  const [newType, setNewType] = useState("");

  useEffect(() => {
    const data = getInitialData() || { missions: {}, factions: [], types: [] };
    setMissions(data.missions ?? {});
    setFactions(data.factions ?? []);
    setTypes(data.types ?? []);
  }, []);

  useEffect(() => {
    saveData(missions, factions, types);
  }, [missions, factions, types]);

  const factionColorsMapping = useMemo(
    () =>
      (factions || []).reduce(
        (acc, f) => ({ ...acc, [f.name]: f.bgColor }),
        {}
      ),
    [factions]
  );

  const { positions, connections, filtered } = useTreeLayout(
    missions,
    zoom,
    pan,
    filter,
    factionColorsMapping
  );

  const handlePanStart = (e) => {
    if (e.button !== 0) return;
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
    const sx = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x;
    const sy = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y;
    return `M ${sx} ${sy} L ${mousePos.x} ${mousePos.y}`;
  };

  const handleAddFaction = (e) => {
    e.preventDefault();
    if (newFaction.name && !factions.find((f) => f.name === newFaction.name)) {
      setFactions([...factions, newFaction]);
      setNewFaction({ name: "", bgColor: "#ffffff", borderColor: "#000000" });
    }
  };

  const handleAddType = (e) => {
    e.preventDefault();
    if (newType && !types.includes(newType)) {
      setTypes([...types, newType]);
      setNewType("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="p-4 bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="w-8 h-8"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="w-8 h-8"
            >
              <ZoomOut size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="w-8 h-8"
            >
              <Home size={16} />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Visualizador de Missões
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Filtrar missões..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-64 bg-white/90 focus:bg-white transition-colors"
                prefixIcon={
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportData(missions, factions, types)}
                className="bg-white/10 text-white border-transparent"
              >
                Exportar
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={(e) =>
                  importData(e, setMissions, setFactions, setTypes)
                }
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
              {factions.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: f.bgColor,
                      border: `2px solid ${f.borderColor}`,
                    }}
                  />
                  <span className="text-sm">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-[70%_30%] gap-4 p-4 overflow-hidden">
        <section
          ref={sectionRef}
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onClick={() => {
            if (connecting) setConnecting(null);
          }}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
        >
          <div className="relative h-[60%] w-full overflow-hidden">
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
              {Object.entries(filtered).map(
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
                      factionConfig={factions.find(
                        (f) => f.name === quest.faction
                      )}
                    />
                  )
              )}
            </div>
          </div>

          <div className="h-[40%] overflow-auto p-4 border-t">
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
            factions={factions}
            types={types}
          />
          <div className="mt-8 max-w-md">
            <h2 className="text-lg font-bold mb-4">Gerenciar Facções</h2>

            <form onSubmit={handleAddFaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="factionName">Nome da Facção</Label>
                <Input
                  id="factionName"
                  type="text"
                  placeholder="Digite o nome da facção"
                  value={newFaction.name}
                  onChange={(e) =>
                    setNewFaction({ ...newFaction, name: e.target.value })
                  }
                  required
                />
              </div>

              <Card className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={newFaction.bgColor}
                      onChange={(e) =>
                        setNewFaction({
                          ...newFaction,
                          bgColor: e.target.value,
                        })
                      }
                      className="w-24 h-10 p-1 cursor-pointer"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      {newFaction.bgColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">Cor da Borda</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={newFaction.borderColor}
                      onChange={(e) =>
                        setNewFaction({
                          ...newFaction,
                          borderColor: e.target.value,
                        })
                      }
                      className="w-24 h-10 p-1 cursor-pointer"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      {newFaction.borderColor}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Prévia</Label>
                  <div
                    className="mt-2 h-16 rounded-lg border-4"
                    style={{
                      backgroundColor: newFaction.bgColor,
                      borderColor: newFaction.borderColor,
                    }}
                  />
                </div>
              </Card>

              <Button type="submit" className="w-full">
                Adicionar Facção
              </Button>
            </form>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-2">Gerenciar Tipos</h2>
            <form onSubmit={handleAddType} className="space-y-2">
              <Input
                type="text"
                placeholder="Nome do Tipo"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Adicionar Tipo
              </Button>
            </form>
          </div>
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
