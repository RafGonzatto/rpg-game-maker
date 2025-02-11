import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { questData, factionColors } from "./questData";
import NewQuestForm from "./NewQuestForm";
import { Card } from "./ui/Card";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 92;
const MIN_LINE_SPACING = 130;

function calculateControlPoint(start, end, index, total) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const offset = (index - (total - 1) / 2) * MIN_LINE_SPACING;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: midX, y: midY };

  const perpX = -dy / length;
  const perpY = dx / length;
  return {
    x: midX + perpX * offset,
    y: midY + perpY * offset,
  };
}

function buildCurve(sx, sy, ex, ey, index, total) {
  const control = calculateControlPoint(
    { x: sx, y: sy },
    { x: ex, y: ey },
    index,
    total
  );
  return `M ${sx} ${sy} Q ${control.x} ${control.y} ${ex} ${ey}`;
}

function useLineConnections(missions, positions, zoom, pan) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const newLines = [];
    const processed = new Set();

    Object.entries(missions).forEach(([id, quest]) => {
      if (!quest.unlocks) return;

      quest.unlocks.forEach((targetId, index) => {
        const key = `${id}-${targetId}`;
        if (processed.has(key)) return;
        processed.add(key);

        const startPos = positions[id];
        const endPos = positions[targetId];
        if (!startPos || !endPos) return;

        const startConnections = quest.unlocks.length;
        const endConnections = missions[targetId]?.requires?.length || 1;

        // Coordenadas ajustadas com pan e zoom
        const sx = (startPos.x + CARD_WIDTH / 2) * zoom + pan.x;
        const sy = (startPos.y + CARD_HEIGHT) * zoom + pan.y;
        const ex = (endPos.x + CARD_WIDTH / 2) * zoom + pan.x;
        const ey = endPos.y * zoom + pan.y;

        const path = buildCurve(sx, sy, ex, ey, index, startConnections);
        newLines.push({
          from: id,
          to: targetId,
          path,
        });
      });
    });

    setLines(newLines);
  }, [missions, positions, zoom, pan]);

  return lines;
}

const QuestNode = ({
  quest,
  selected,
  onClick,
  pos,
  onStartConnect,
  onRequestDelete,
}) => {
  return (
    <div
      className={`absolute p-4 rounded-lg border-2 cursor-pointer transition-all ${
        factionColors[quest.faction]
      } ${selected ? "ring-2 ring-purple-500 transform scale-105" : ""}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: 200,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(quest.id);
      }}
    >
      <h3 className="font-bold text-sm mb-1">{quest.title}</h3>
      <p className="text-xs text-gray-600">Tipo: {quest.type}</p>
      <p className="text-xs text-gray-600">Facção: {quest.faction}</p>
      {selected && (
        <div className="absolute top-2 right-2 flex flex-col items-center gap-1">
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
};

const QuestDetails = ({ id, missions }) => {
  const quest = missions[id];
  if (!quest) return null;
  return (
    <Card className="p-4 mt-4">
      <h2 className="font-bold text-lg mb-2">{quest.title}</h2>
      <p>
        <span className="font-semibold">Facção:</span> {quest.faction}
      </p>
      <p>
        <span className="font-semibold">Tipo:</span> {quest.type}
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

export default function QuestView({
  missions,
  setMissions,
  positions,
  selectedQuest,
  setSelectedQuest,
  onExport,
  onImport,
  onAddQuest,
}) {
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);

  // Zoom e Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  const lines = useLineConnections(missions, positions, zoom, pan);

  const handlePanStart = (e) => {
    setIsPanning(true);
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanEnd = () => setIsPanning(false);

  const handleZoomIn = () => setZoom((z) => z * 1.1);
  const handleZoomOut = () => setZoom((z) => z / 1.1);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handlePanEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, []);

  function hasPath(m, from, to, visited = new Set()) {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    return m[from]?.unlocks?.some((next) => hasPath(m, next, to, visited));
  }

  const handleQuestClick = (id) => {
    if (connecting && connecting !== id) {
      // Evita loop
      if (hasPath(missions, id, connecting)) {
        alert("Isto geraria loop de dependências!");
        setConnecting(null);
        return;
      }
      const newMissions = { ...missions };
      if (!newMissions[connecting].unlocks.includes(id))
        newMissions[connecting].unlocks.push(id);
      if (!newMissions[id].requires.includes(connecting))
        newMissions[id].requires.push(connecting);
      setMissions(newMissions);
      setConnecting(null);
    } else if (connecting === id) {
      setConnecting(null); // Cancelou
    } else {
      setSelectedQuest(id);
    }
  };

  const handleStartConnect = (id) => setConnecting(id);

  const handleDeleteRequest = (id) => setDeleteId(id);

  const handleDeleteConfirm = () => {
    const newMissions = { ...missions };
    Object.values(newMissions).forEach((q) => {
      q.requires = q.requires.filter((r) => r !== deleteId);
      q.unlocks = q.unlocks.filter((u) => u !== deleteId);
    });
    delete newMissions[deleteId];
    setMissions(newMissions);
    setDeleteId(null);
    if (selectedQuest === deleteId) setSelectedQuest(null);
  };

  // Linha temporária de conexão (do nó clicado até o mouse)
  const buildTemporaryConnection = () => {
    if (!connecting || !positions[connecting]) return "";
    const sx = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x;
    const sy = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y;
    const ex = mousePos.x;
    const ey = mousePos.y;
    return `M ${sx},${sy} L ${ex},${ey}`;
  };

  return (
    <div className="h-screen grid grid-rows-[10vh_90vh]">
      {/* Header */}
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
            id="file-input"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input").click()}
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

      {/* Main */}
      <main className="grid grid-cols-[70%_30%] h-full">
        {/* Coluna do grafo */}
        <section
          className="border rounded-lg overflow-hidden relative"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onClick={() => {
            if (connecting) setConnecting(null);
          }}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
        >
          {/* Botões de zoom */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            <Button variant="outline" onClick={handleZoomIn}>
              +
            </Button>
            <Button variant="outline" onClick={handleZoomOut}>
              -
            </Button>
          </div>

          {/* Área do gráfico */}
          <div className="relative h-[80%] w-full overflow-hidden">
            {/* SVG de conexões */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {lines.map((line, index) => (
                <path
                  key={`${line.from}-${line.to}-${index}`}
                  d={line.path}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-300"
                />
              ))}
              {/* Linha de conexão em andamento */}
              {connecting && (
                <path
                  d={buildTemporaryConnection()}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-blue-500"
                />
              )}
            </svg>

            {/* Container escalonado para nós */}
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
              {Object.entries(missions).map(([id, quest]) => (
                <QuestNode
                  key={id}
                  quest={quest}
                  selected={selectedQuest === id}
                  onClick={handleQuestClick}
                  pos={positions[id]}
                  onStartConnect={handleStartConnect}
                  onRequestDelete={handleDeleteRequest}
                />
              ))}
            </div>
          </div>

          {/* Detalhes do quest selecionado */}
          <div className="h-[20%] overflow-auto p-2 bg-gray-100">
            {selectedQuest && (
              <QuestDetails id={selectedQuest} missions={missions} />
            )}
          </div>
        </section>

        {/* Coluna do formulário */}
        <aside className="p-4 overflow-auto">
          <h2 className="text-lg font-bold mb-2">Nova Missão</h2>
          <NewQuestForm
            onSave={onAddQuest}
            missions={missions}
            factions={questData.factions}
          />
        </aside>
      </main>

      {/* Modal de confirmação */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md">
            <p className="mb-4">Tem certeza que deseja excluir esta missão?</p>
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
