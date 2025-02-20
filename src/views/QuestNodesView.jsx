////////views/QuestNodesView.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import useTreeLayout from "../hooks/useTreeLayout";
import { Button } from "../components/ui/Button";
import ResizableLayout from "../components/ui/ResizableLayout";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { AnimatedSprite, BeerAnimated } from "../utils/animation";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Home,
  Plus,
  Trash2,
  Link,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
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
      className={`absolute p-4 rounded-lg border-2 shadow-lg cursor-pointer transition-all ${
        selected ? "ring-4 ring-purple-500 scale-105" : ""
      }`}
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: selected ? 100 : 1,
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
        <div className="absolute -right-11 z-50 top-1/2 flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer"
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
              <TooltipTrigger asChild>
                <div
                  className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
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
    <Card className="p-6 bg-white shadow-none border-2 border-gray-100 ">
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
  setView,
  onAddQuest,
  onExport,
  onImport,
  factions,
  setFactions, // adicionado
  types,
  setTypes, // adicionado
}) {
  // Estados já existentes
  const headerRef = useRef(null);
  const hasMovedRef = useRef(false);
  const wallRef = useRef(null);
  const [wallRight, setWallRight] = useState(0);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const [filter, setFilter] = useState("");
  const [isPanning, setIsPanning] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    function measure() {
      if (headerRef.current && wallRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const wallRect = wallRef.current.getBoundingClientRect();
        const wallHeight = wallRef.current.clientHeight;
        const img = new Image();
        img.src = "../src/images/wall.png";
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          const displayedWallWidth = wallHeight * ratio;
          const wallLeftRelative = wallRect.left - headerRect.left;
          setWallRight(wallLeftRelative + displayedWallWidth);
        };
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Estados para os formulários de Facções/Tipos
  const [newFaction, setNewFaction] = useState({
    name: "",
    bgColor: "#ffffff",
    borderColor: "#000000",
  });
  const [newType, setNewType] = useState("");

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
    hasMovedRef.current = false; // Reseta ao iniciar
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startRef.current.x,
      dy = e.clientY - startRef.current.y;

    // Marca se houve movimento significativo
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasMovedRef.current = true;
    }

    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };
  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2));
  const handleReset = () => {
    setZoom(1);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2 - CARD_WIDTH / 2, y: 50 });
    }
  };
  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, zoom * (1 - e.deltaY * 0.001))
    );
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

  useEffect(() => {
    sectionRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => sectionRef.current?.removeEventListener("wheel", handleWheel);
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
        alert("Loop de dependências!");
        return setConnecting(null);
      }
      const newM = { ...missions };
      if (!newM[connecting].unlocks.includes(id)) {
        newM[connecting].unlocks.push(id);
        newM[id].requires.push(connecting);
      }
      setMissions(newM);
      setConnecting(null);
    } else {
      setSelectedQuest(id);
    }
  };

  const buildTempConnection = () => {
    if (!connecting || !positions[connecting] || !svgRef.current) return "";

    // Obtém as coordenadas relativas ao SVG
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = mousePos.x - svgRect.left;
    const mouseY = mousePos.y - svgRect.top;

    // Calcula ponto inicial com zoom/pan
    const startX = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x;
    const startY = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y;

    return `M ${startX} ${startY} L ${mouseX} ${mouseY}`;
  };

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
    <div className="h-screen flex flex-col select-none bg-yellow-800">
      <header
        ref={headerRef}
        className="relative bg-rose-600 h-[20vh] grid grid-cols-4"
      >
        <AnimatedSprite />
        <div className="absolute bottom-0 left-0 w-full h-[10%]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(../src/images/board.png)`,
              imageRendering: "pixelated",
              backgroundSize: "auto 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "bottom",
            }}
          />
        </div>

        <BeerAnimated />
        <div
          ref={wallRef}
          className="z-[5] absolute left-[15%] top-0 w-full h-[90%] pointer-events-none"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(../src/images/wall.png)`,
              imageRendering: "pixelated",
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        {/* Seção 1: sprite animado */}
        {/* Seção 2: sprite animado */}
        <div className="bg-[url('/sprites/sprite2.png')] bg-cover animate-sprite" />
        {/* Seção 3: botões e título */}
        <div className="flex flex-col justify-center p-4">
          <h1
            className="z-[40] text-2xl font-bold text-white pointer-events-none"
            style={{
              position: "absolute",
              left: wallRight + 10, // inicia logo após o final da imagem da wall
              top: 0,
            }}
          >
            Missões
          </h1>
          <div
            className="relative flex items-center gap-4"
            style={{
              position: "absolute",
              left: wallRight + 10, // inicia logo após o final da imagem da wall
            }}
          >
            <Input
              type="text"
              placeholder="   Filtrar missões..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 bg-amber-50"
              prefixIcon={<Search />}
            />
            <Button onClick={onExport}>Exportar</Button>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
              id="file-input-nodes"
            />
            <Button
              onClick={() =>
                document.getElementById("file-input-nodes").click()
              }
            >
              Importar
            </Button>
          </div>
        </div>
      </header>
      {/*  */}
      <main className="flex-1 p-4 overflow-hidden">
        <ResizableLayout>
          <section
            ref={sectionRef}
            className="relative bg-white rounded-lg overflow-visible"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onClick={() => {
              if (!hasMovedRef.current && connecting) {
                setConnecting(null);
              }
            }}
            style={{ height: "calc(100vh - 180px)" }}
          >
            <div
              ref={containerRef}
              className="bg-yellow-50 relative h-full w-full overflow-hidden select-none"
            >
              <svg
                ref={svgRef} // Adicione esta linha
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              >
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
              <div className="absolute top-4 left-4 flex gap-2 z-[100]">
                <Button onClick={handleZoomIn}>
                  <ZoomIn size={16} />
                </Button>
                <Button onClick={handleZoomOut}>
                  <ZoomOut size={16} />
                </Button>
                <Button onClick={handleReset}>
                  <Home size={16} />
                </Button>
              </div>
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
                        onStartConnect={setConnecting}
                        onRequestDelete={(id) => setDeleteId(id)}
                        factionConfig={factions.find(
                          (f) => f.name === quest.faction
                        )}
                      />
                    )
                )}
              </div>
            </div>
          </section>
          <div className="h-full p-4 border-t select-none">
            {selectedQuest && (
              <QuestDetails id={selectedQuest} missions={missions} />
            )}
          </div>
          <aside className="h-full bg-white rounded-lg p-4 overflow-auto no-selection">
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
        </ResizableLayout>
      </main>
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir esta missão?</p>
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
