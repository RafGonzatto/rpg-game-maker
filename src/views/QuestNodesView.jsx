// QuestNodesView.jsx
import React, { useState, useCallback, memo } from "react";
import toast from 'react-hot-toast';
import ReactDOM from "react-dom";
import { QuestNode } from "./QuestNode";
import { Button } from "../components/ui/Button";
import ResizableLayout from "../components/ui/ResizableLayout";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { AnimatedSprite, BeerAnimated } from "../utils/animation";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Home,
  Minimize2,
  Maximize2,
  ChevronRight,
} from "lucide-react";
import useQuestNodesLogic from "../hooks/useQuestNodesLogic";

function NewQuestForm({ onSave, missions, factions, types }) {
  const [filter, setFilter] = useState("");
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    faction: "",
    type: "",
    dialogo: "",
    requires: [],
    unlocks: [],
    reputation: {},
  });
  const filtered = Object.entries(missions || {}).filter(([, m]) =>
    m.title.toLowerCase().includes(filter.toLowerCase())
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.title || !formState.faction || !formState.type) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }
    const id = formState.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    try {
      onSave({ ...formState, id });
      toast.success('Missão criada com sucesso!');
      setFormState({
        id: "",
        title: "",
        faction: "",
        type: "",
        dialogo: "",
        requires: [],
        unlocks: [],
        reputation: {},
      });
    } catch (e) {
      toast.error('Erro ao criar missão!');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Título</Label>
        <Input
          required
          value={formState.title}
          onChange={(e) =>
            setFormState((p) => ({ ...p, title: e.target.value }))
          }
        />
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col flex-1">
          <Label>Facção</Label>
          <select
            required
            className="p-2 border rounded"
            value={formState.faction}
            onChange={(e) =>
              setFormState((p) => ({ ...p, faction: e.target.value }))
            }
          >
            <option value="">Selecione</option>
            {factions.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col flex-1">
          <Label>Tipo</Label>
          <select
            required
            className="p-2 border rounded"
            value={formState.type}
            onChange={(e) =>
              setFormState((p) => ({ ...p, type: e.target.value }))
            }
          >
            <option value="">Selecione</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Diálogo</Label>
        <textarea
          className="w-full p-2 border rounded"
          value={formState.dialogo}
          onChange={(e) =>
            setFormState((p) => ({ ...p, dialogo: e.target.value }))
          }
        />
      </div>
      <div>
        <Label>Requisitos</Label>
        <Input
          type="text"
          placeholder="Filtrar requisitos"
          className="mb-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(([id, m]) => (
            <label key={id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formState.requires.includes(id)}
                onChange={(e) => {
                  if (e.target.checked)
                    setFormState((p) => ({
                      ...p,
                      requires: [...p.requires, id],
                    }));
                  else
                    setFormState((p) => ({
                      ...p,
                      requires: p.requires.filter((r) => r !== id),
                    }));
                }}
              />
              <span>{m.title}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Reputação</Label>
        <div className="grid grid-cols-3 gap-2">
          {factions.map((f) => (
            <div key={f.name} className="flex items-center space-x-2">
              <Input
                type="number"
                className="w-16"
                value={formState.reputation[f.name] || 0}
                onChange={(e) =>
                  setFormState((p) => ({
                    ...p,
                    reputation: {
                      ...p.reputation,
                      [f.name]: parseInt(e.target.value) || 0,
                    },
                  }))
                }
              />
              <Label>{f.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {formState.id ? "Atualizar Missão" : "Adicionar Missão"}
      </Button>
    </form>
  );
}

export default function QuestNodesView({
  missions,
  setMissions,
  factions,
  setFactions,
  types,
  setTypes,
  selectedQuest,
  setSelectedQuest,
}) {
  const {
    wallRight,
    filter,
    setFilter,
    exportMissions,
    importMissions,
    saveMission,
    positions,
    connections,
    pan,
    zoom,
    filtered,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleReset,
    handleZoomIn,
    handleZoomOut,
    buildTempConnection,
    handleQuestClick,
    toggleSection,
    minimized,
    verticalDividerPosition,
    horizontalDividerPosition,
    setVerticalDividerPosition,
    setHorizontalDividerPosition,
    containerRef,
    sectionRef,
    svgRef,
    wallRef,
    headerRef,
    openDetailsInNewWindow,
    openFormInNewWindow,
    detailsContainer,
    formContainer,
    deleteId,
    setDeleteId,
    handleDeleteConfirm,
    newFaction,
    setNewFaction,
    handleAddFaction,
    newType,
    setNewType,
    handleAddType,
    factionSvgColors,
    connecting,
    setConnecting,
    isPanning,
  } = useQuestNodesLogic({
    missions,
    setMissions,
    factions,
    setFactions,
    types,
    setTypes,
    selectedQuest,
    setSelectedQuest,
  });

  const handleSectionMouseDown = (e) => handlePanStart(e);
  const INTERACTIVE = [
    "input",
    "select",
    "textarea",
    "button",
    "label",
    ".no-pan",
    "[contenteditable='true']",
  ].join(",");
  const handleSectionMouseMove = useCallback(
    (e) => {
      if (!isPanning || e.target.closest(INTERACTIVE)) return;
      handlePanMove(e);
    },
    [isPanning, handlePanMove]
  );
  const handleSectionClick = (e) => {
    if (!e.target.closest(INTERACTIVE) && !connecting) setConnecting(null);
  };
  const DetailsContent = memo(function DetailsContent() {
    if (!selectedQuest) return null;
    const quest = missions[selectedQuest];
    if (!quest) return null;
    return (
      <Card className="p-6 bg-white border-2 border-gray-100 shadow-none">
        <h2 className="font-bold text-2xl mb-6 border-b pb-3 text-gray-800">
          {quest.title}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Facção</p>
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
            <p className="font-semibold">Tipo</p>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {quest.type}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <p className="font-semibold mb-2">Requer</p>
          <div className="bg-gray-50 p-3 rounded">
            {quest.requires?.length ? (
              <ul className="space-y-1">
                {quest.requires.map((reqId) => (
                  <li key={reqId} className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {missions[reqId]?.title || reqId}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nenhum requisito</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="font-semibold mb-2">Desbloqueia</p>
          <div className="bg-gray-50 p-3 rounded">
            {quest.unlocks?.length ? (
              <ul className="space-y-1">
                {quest.unlocks.map((u) => (
                  <li key={u} className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
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
            <p className="font-semibold mb-2">Diálogo</p>
            <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
              {quest.dialogo}
            </div>
          </div>
        )}
        {quest.reputation && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Reputação</p>
            <div className="bg-gray-50 p-3 rounded">
              <ul className="space-y-1">
                {Object.entries(quest.reputation).map(([fac, val]) => (
                  <li
                    key={fac}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{fac}</span>
                    <span
                      className={val > 0 ? "text-green-500" : "text-red-500"}
                    >
                      {val}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    );
  });
  DetailsContent.displayName = "DetailsContent";

  const FormContent = memo(function FormContent() {
    return (
      <div>
        <NewQuestForm
          onSave={saveMission}
          missions={missions}
          factions={factions}
          types={types}
        />
        <h2 className="text-lg font-bold mb-4 mt-6">Gerenciar Facções</h2>
        <form onSubmit={handleAddFaction} className="space-y-4">
          <Label>Nome da Facção</Label>
          <Input
            required
            value={newFaction.name}
            onChange={(e) =>
              setNewFaction({ ...newFaction, name: e.target.value })
            }
          />
          <Label>Cor de Fundo</Label>
          <div className="flex items-center gap-2">
            <Input
              required
              type="color"
              className="w-24 h-10 cursor-pointer"
              value={newFaction.bgColor}
              onChange={(e) =>
                setNewFaction({ ...newFaction, bgColor: e.target.value })
              }
            />
            <span className="text-sm">{newFaction.bgColor}</span>
          </div>
          <Label>Cor da Borda</Label>
          <div className="flex items-center gap-2">
            <Input
              required
              type="color"
              className="w-24 h-10 cursor-pointer"
              value={newFaction.borderColor}
              onChange={(e) =>
                setNewFaction({ ...newFaction, borderColor: e.target.value })
              }
            />
            <span className="text-sm">{newFaction.borderColor}</span>
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
          <Button type="submit" className="w-full mt-4">
            Adicionar Facção
          </Button>
        </form>
        <h2 className="text-lg font-bold mb-2 mt-8">Gerenciar Tipos</h2>
        <form onSubmit={handleAddType} className="space-y-2">
          <Input
            required
            type="text"
            placeholder="Nome do Tipo"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Adicionar Tipo
          </Button>
        </form>
      </div>
    );
  });
  FormContent.displayName = "FormContent";
  const MemoNode = memo(QuestNode);

  return (
    <div className="h-screen flex flex-col bg-yellow-800 overflow-hidden">
      <header
        ref={headerRef}
        className="relative bg-rose-600 h-[20vh] grid grid-cols-4"
      >
        <AnimatedSprite />
        <div className="absolute bottom-0 left-0 w-full h-[10%]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url(../src/images/board.png)",
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
          className="pointer-events-none absolute left-[15%] top-0 w-full h-[90%]"
          style={{ zIndex: 5 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url(../src/images/wall.png)",
              imageRendering: "pixelated",
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        <div />
        <div className="flex flex-col z-50 justify-center p-4">
          <h1
            className="z-[40] text-2xl font-bold text-white"
            style={{ position: "absolute", left: wallRight + 10, top: 0 }}
          >
            Missões
          </h1>
          <div
            className="relative flex items-center gap-4"
            style={{ position: "absolute", left: wallRight + 10 }}
          >
            <Input
              placeholder="   Filtrar missões..."
              className="pl-10 bg-amber-50"
              prefixIcon={<Search />}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={exportMissions}>Exportar</Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importMissions}
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
      <main className="flex-1 p-4 overflow-hidden">
        <ResizableLayout
          verticalDividerPosition={verticalDividerPosition}
          horizontalDividerPosition={horizontalDividerPosition}
          onVerticalDividerChange={setVerticalDividerPosition}
          onHorizontalDividerChange={setHorizontalDividerPosition}
        >
          <section
            ref={sectionRef}
            className="relative bg-white rounded-lg overflow-visible"
            style={{ height: "calc(100vh - 180px)" }}
            onMouseDown={handleSectionMouseDown}
            onMouseMove={handleSectionMouseMove}
            onClick={handleSectionClick}
            onMouseUp={handlePanEnd}
          >
            <div
              ref={containerRef}
              className="bg-yellow-50 relative h-full w-full"
            >
              <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full">
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
                {connections.map((conn) => {
                  const parent = missions[conn.from];
                  const color = parent
                    ? factionSvgColors[parent.faction] || "#000"
                    : "#000";
                  return (
                    <path
                      key={conn.id}
                      d={conn.path}
                      stroke={color}
                      strokeWidth={selectedQuest === conn.from ? 3 : 2}
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                {buildTempConnection() && (
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
                {Object.entries(filtered).map(([id, quest]) => {
                  if (!positions[id]) return null;
                  const fc = factions.find((f) => f.name === quest.faction) || {
                    bgColor: "#fff",
                    borderColor: "#000",
                  };
                  return (
                    <MemoNode
                      key={id}
                      quest={quest}
                      pos={positions[id]}
                      selected={selectedQuest === id}
                      factionConfig={fc}
                      onClick={handleQuestClick}
                      onStartConnect={(qId) => setConnecting(qId)}
                      onRequestDelete={setDeleteId}
                    />
                  );
                })}
              </div>
            </div>
          </section>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Detalhes da Missão</h3>
              <Button onClick={openDetailsInNewWindow}>
                Abrir em Outra Janela
              </Button>
              <Button onClick={() => toggleSection("details")}>
                {minimized.details ? <Maximize2 /> : <Minimize2 />}
              </Button>
            </div>
            {!detailsContainer && !minimized.details && <DetailsContent />}
          </div>
          <div className="h-full z-50">
            {minimized.form ? (
              <div className="flex items-center justify-center h-full">
                <Button onClick={() => toggleSection("form")}>
                  <ChevronRight size={24} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex p-4 border-b">
                  <h2 className="text-lg font-bold">Nova Card</h2>
                  <Button
                    className="absolute right-24"
                    onClick={openFormInNewWindow}
                  >
                    Abrir em Outra Janela
                  </Button>
                  <Button
                    className="absolute right-5"
                    onClick={() => toggleSection("form")}
                  >
                    <Minimize2 size={16} />
                  </Button>
                </div>
                {!formContainer && (
                  <div className="p-4 overflow-auto h-[calc(100% - 56px)]">
                    <FormContent />
                  </div>
                )}
              </>
            )}
          </div>
        </ResizableLayout>
      </main>
      {detailsContainer &&
        ReactDOM.createPortal(<DetailsContent />, detailsContainer)}
      {formContainer && ReactDOM.createPortal(<FormContent />, formContainer)}
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
