////////////////////////////views/QuestGraphView.jsx

import React, { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Button } from "../components/ui/Button";
import { questData, factionColors } from "../components/questData";
//import NewQuestForm from "./NewQuestForm";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 92;

const hasPath = (missions, from, to, visited = new Set()) => {
  if (from === to) return true;
  if (visited.has(from)) return false;
  visited.add(from);
  return missions[from]?.unlocks?.some((nx) =>
    hasPath(missions, nx, to, visited)
  );
};

export default function QuestGraphView({
  missions,
  setMissions,
  selectedQuest,
  setSelectedQuest,
  onExport,
  onImport,
  onAddQuest,
}) {
  // Garante que hooks sempre sejam chamados
  const [connecting, setConnecting] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const width = 1200,
    height = 800;
  const safeMissions = missions || {};
  const nodes = Object.values(safeMissions);
  const links = nodes.flatMap((node) =>
    (node.unlocks || []).map((targetId) => ({ source: node.id, target: targetId }))
  );
  const [positions, setPositions] = useState({});
  const simRef = useRef(null);

  // Sliders para controlar parâmetros da simulação
  const [linkDistance, setLinkDistance] = useState(250);
  const [velocityDecay, setVelocityDecay] = useState(0.4);

  // Referência ao SVG e estado para drag de nós
  const svgRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Configura a simulação
  useEffect(() => {
    if (!nodes.length) return;
    const sim = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force("charge", forceManyBody().strength(-500))
      .force("collide", forceCollide(60))
      .force("center", forceCenter(width / 2, height / 2))
      .on("tick", () => {
        const pos = {};
        nodes.forEach((n) => {
          pos[n.id] = { x: n.x, y: n.y };
        });
        setPositions(pos);
      });
    simRef.current = sim;
    return () => sim.stop();
  }, [nodes, links, linkDistance]);

  // Move all hooks to top-level, before any return/conditional
  // Atualiza a simulação quando os sliders mudam
  useEffect(() => {
    if (simRef.current) {
      simRef.current.force("link").distance(linkDistance);
      simRef.current.velocityDecay(velocityDecay);
      simRef.current.alpha(1).restart();
    }
  }, [linkDistance, velocityDecay]);

  const [{ transform }, api] = useSpring(() => ({
    transform: `translate(0px,0px) scale(1)`,
  }));
  useEffect(() => {
    api.start({
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    });
  }, [offset, zoom, api]);

  const bind = useDrag(({ active, delta: [dx, dy] }) => {
    if (active) setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  });
  const handleZoomIn = () => setZoom((z) => z * 1.1);
  const handleZoomOut = () => setZoom((z) => z / 1.1);


  // Always call hooks at the top level, never conditionally!
  // Instead, render a loading message below if missions is not loaded

  const handleNodeClick = (nodeId) => {
    if (connecting && connecting !== nodeId) {
      if (hasPath(missions, nodeId, connecting)) {
        alert("Geraria loop de dependências!");
      } else {
        const updated = { ...missions };
        if (!updated[connecting].unlocks.includes(nodeId))
          updated[connecting].unlocks.push(nodeId);
        if (!updated[nodeId].requires.includes(connecting))
          updated[nodeId].requires.push(connecting);
        setMissions(updated);
      }
      setConnecting(null);
    } else if (connecting === nodeId) {
      setConnecting(null);
    } else {
      setSelectedQuest(nodeId);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    try {
      const newM = { ...missions };
      Object.values(newM).forEach((q) => {
        q.requires = q.requires.filter((r) => r !== deleteId);
        q.unlocks = q.unlocks.filter((u) => u !== deleteId);
      });
      delete newM[deleteId];
      setMissions(newM);
      if (selectedQuest === deleteId) setSelectedQuest(null);
      setDeleteId(null);
      toast.success('Missão excluída com sucesso!');
    } catch (e) {
      toast.error('Erro ao excluir missão!');
    }
  };

  const QuestDetails = ({ questId }) => {
    const quest = missions[questId];
    if (!quest) return null;
    return (
      <div className="p-4 border rounded">
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
                <li key={r}>{missions[r]?.title || r}</li>
              ))
            ) : (
              <li>Nenhum</li>
            )}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Desbloqueia:</p>
          <ul className="list-disc pl-5">
            {quest.unlocks.length ? (
              quest.unlocks.map((u) => (
                <li key={u}>{missions[u]?.title || u}</li>
              ))
            ) : (
              <li>Nenhum</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  // Converte as coordenadas do ponteiro para o sistema de coordenadas do SVG
  function getSvgCoordinates(event) {
    const svg = svgRef.current;
    if (svg) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    }
    return { x: event.clientX, y: event.clientY };
  }

  function handleNodePointerDown(id, e) {
    e.stopPropagation();
    setDraggingNodeId(id);
    const coords = getSvgCoordinates(e);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      node.fx = coords.x;
      node.fy = coords.y;
      simRef.current.alphaTarget(0.3).restart();
    }
  }

  // Durante o drag do nó, atualiza sua posição fixa
  useEffect(() => {
    function onPointerMove(e) {
      if (!draggingNodeId) return;
      e.preventDefault();
      const coords = getSvgCoordinates(e);
      const node = nodes.find((n) => n.id === draggingNodeId);
      if (node) {
        node.fx = coords.x;
        node.fy = coords.y;
        simRef.current.alphaTarget(0.3).restart();
      }
    }
    function onPointerUp(e) {
      if (!draggingNodeId) return;
      const node = nodes.find((n) => n.id === draggingNodeId);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      setDraggingNodeId(null);
      simRef.current.alphaTarget(0);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    if (draggingNodeId) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [draggingNodeId, nodes]);

  return (
    <div className="h-screen grid grid-rows-[auto_1fr]">
      {(!missions) ? (
        <div className="flex items-center justify-center h-full w-full">
          <p>Carregando missões...</p>
        </div>
      ) : (
        <>
          <header className="p-4 flex flex-wrap gap-4 items-center justify-between border-b">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            Exportar
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            id="file-input-graph"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input-graph").click()}
          >
            Importar
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleZoomIn}>
            +
          </Button>
          <Button variant="outline" onClick={handleZoomOut}>
            -
          </Button>
        </div>
        <div className="flex gap-2">
          {questData.factions.map((f) => (
            <div key={f} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${factionColors[f]}`}></div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </header>
      {/* Sliders para controlar a distância dos links e o decay (elasticidade) */}
      <div className="p-4 flex gap-4 items-center border-b">
        <label className="flex items-center gap-2">
          Distância:
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={linkDistance}
            onChange={(e) => setLinkDistance(+e.target.value)}
          />
          <span>{linkDistance}</span>
        </label>
        <label className="flex items-center gap-2">
          Velocidade:
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={velocityDecay}
            onChange={(e) => setVelocityDecay(+e.target.value)}
          />
          <span>{velocityDecay}</span>
        </label>
      </div>
      <main className="grid grid-cols-[70%_30%] h-full">
        <div
          className="border relative"
          {...bind()}
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
        >
          <animated.svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ background: "#f9fafb" }}
          >
            <animated.g style={{ transform, transformOrigin: "0 0" }}>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill="#64748b" />
                </marker>
              </defs>
              {links.map((lk, i) => {
                const sourceId =
                  typeof lk.source === "object" ? lk.source.id : lk.source;
                const targetId =
                  typeof lk.target === "object" ? lk.target.id : lk.target;
                const sPos = positions[sourceId];
                const tPos = positions[targetId];
                if (!sPos || !tPos) return null;
                return (
                  <line
                    key={i}
                    x1={sPos.x}
                    y1={sPos.y + CARD_HEIGHT / 2}
                    x2={tPos.x}
                    y2={tPos.y - CARD_HEIGHT / 2}
                    stroke="#64748b"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {nodes.map((node) => {
                const pos = positions[node.id] || {
                  x: width / 2,
                  y: height / 2,
                };
                const isSelected = selectedQuest === node.id;
                return (
                  <foreignObject
                    key={node.id}
                    x={pos.x - CARD_WIDTH / 2}
                    y={pos.y - CARD_HEIGHT / 2}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                  >
                    <div
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        factionColors[node.faction]
                      } ${
                        isSelected
                          ? "ring-2 ring-purple-500 transform scale-105"
                          : ""
                      }`}
                      style={{ width: CARD_WIDTH }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node.id);
                      }}
                      onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                    >
                      <h3 className="font-bold text-sm mb-1">{node.title}</h3>
                      <p className="text-xs text-gray-600">Tipo: {node.type}</p>
                      <p className="text-xs text-gray-600">
                        Facção: {node.faction}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <button
                            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConnecting(node.id);
                            }}
                          >
                            +
                          </button>
                          <button
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(node.id);
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                );
              })}
            </animated.g>
          </animated.svg>
        </div>
        <div className="p-4 overflow-auto">
          {selectedQuest ? (
            <QuestDetails questId={selectedQuest} />
          ) : (
            <>
              <h2 className="font-bold text-lg mb-2">Nova Missão</h2>
              {/* <NewQuestForm
                onSave={onAddQuest}
                missions={missions}
                factions={questData.factions}
              /> */}
            </>
          )}
        </div>
      </main>
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
        </>
      )}
    </div>
  );
}
