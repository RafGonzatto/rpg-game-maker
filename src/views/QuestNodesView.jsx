///////////QuestNodesView.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { QuestNode } from "./QuestNode";
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
  Minimize2,
  Maximize2,
  ChevronRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import NewQuestForm from "./NewQuestForm";
import useQuestNodesLogic from "../hooks/useQuestNodesLogic";

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
    onExport,
    onImport,
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
    onStartConnect,
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

  const [isTyping, setIsTyping] = useState(false);
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

  const isEditing = () =>
    document.activeElement && document.activeElement.closest("form");

  const isFormElement = (element) =>
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA" ||
    element.closest("form") !== null;

  const handleSectionMouseDown = (e) => {
    if (isFormElement(e.target)) return;
    handlePanStart(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (handlePanEnd) handlePanEnd();
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handlePanEnd]);

  useEffect(() => {
    const handleFocus = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "SELECT" ||
        e.target.tagName === "TEXTAREA"
      )
        setIsTyping(true);
    };
    const handleBlur = () => setIsTyping(false);
    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("blur", handleBlur, true);
    };
  }, []);

  const handleSectionClick = (e) => {
    if (isFormElement(e.target)) return;
    if (!connecting) setConnecting(null);
  };

  const handleSectionMouseMove = (e) => {
    if (!isFormElement(e.target)) {
      handlePanMove(e);
    }
  };

  useEffect(() => {
    let startPos = null;
    const onMouseDown = (e) => (startPos = { x: e.clientX, y: e.clientY });
    const onMouseUp = (e) => {
      if (
        startPos &&
        Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) < 5
      )
        setConnecting(null);
      startPos = null;
    };
    const onKeyUp = (e) => e.key === "Escape" && setConnecting(null);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const DetailsContent = () => {
    if (!selectedQuest) return null;
    const quest = missions[selectedQuest];
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
          <p className="font-semibold text-gray-700 mb-2">Desbloqueia</p>
          <div className="bg-gray-50 p-3 rounded">
            {quest.unlocks?.length ? (
              <ul className="space-y-1">
                {quest.unlocks.map((unlockId) => (
                  <li
                    key={unlockId}
                    className="text-sm flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {missions[unlockId]?.title || unlockId}
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
        {quest.reputation && (
          <div className="mt-4">
            <p className="font-semibold text-gray-700 mb-2">Reputação</p>
            <div className="bg-gray-50 p-3 rounded">
              <ul className="space-y-1">
                {Object.entries(quest.reputation).map(([fac, val]) => (
                  <li
                    key={fac}
                    className="text-sm flex items-center justify-between"
                  >
                    <span>{fac}</span>
                    <span
                      className={val > 0 ? "text-green-500" : "text-red-500"}
                    >
                      {val > 0 ? `${val}` : val}
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

  const FormContent = () => (
    <>
      <NewQuestForm
        onSave={onExport}
        missions={missions}
        factions={factions}
        types={types}
        formState={formState}
        setFormState={setFormState}
      />
      <h2 className="text-lg flex-col-2 font-bold mb-4">Gerenciar Facções</h2>
      <form onSubmit={handleAddFaction} className="space-y-4">
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
        <Label htmlFor="bgColor">Cor de Fundo</Label>
        <div className="flex items-center gap-2">
          <Input
            id="bgColor"
            type="color"
            value={newFaction.bgColor}
            onChange={(e) =>
              setNewFaction({ ...newFaction, bgColor: e.target.value })
            }
            className="w-24 h-10 p-1 cursor-pointer"
            required
          />
          <span className="text-sm text-gray-600">{newFaction.bgColor}</span>
        </div>
        <Label htmlFor="borderColor">Cor da Borda</Label>
        <Input
          id="borderColor"
          type="color"
          value={newFaction.borderColor}
          onChange={(e) =>
            setNewFaction({ ...newFaction, borderColor: e.target.value })
          }
          className="w-24 h-10 p-1 cursor-pointer"
          required
        />
        <span className="text-sm text-gray-600">{newFaction.borderColor}</span>
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
        <Button type="submit" className="w-full">
          Adicionar Facção
        </Button>
      </form>
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
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-yellow-800 overflow-hidden ">
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
          className="z-[5] absolute left-[15%] top-0 w-full h-[90%]"
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
        <div className="bg-[url('/sprites/sprite2.png')] bg-cover animate-sprite" />
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
            onMouseDown={handleSectionMouseDown}
            onMouseMove={handleSectionMouseMove}
            onClick={handleSectionClick}
            style={{ height: "calc(100vh - 180px)" }}
          >
            <div
              ref={containerRef}
              className="bg-yellow-50 relative h-full w-full overflow-hidden"
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
                    ? factionSvgColors[parent.faction]
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
                {buildTempConnection && (
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
                  const factionConfig =
                    factions.find((f) => f.name === quest.faction) || {};
                  return (
                    <QuestNode
                      key={id}
                      quest={quest}
                      pos={positions[id]}
                      selected={selectedQuest === id}
                      factionConfig={factionConfig}
                      onClick={handleQuestClick}
                      onStartConnect={onStartConnect}
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
              <Button
                className="mt-[-45px] mr-[-25px]"
                onClick={() => toggleSection("details")}
              >
                {minimized.details ? <Maximize2 /> : <Minimize2 />}
              </Button>
            </div>
            {!detailsContainer && !minimized.details && <DetailsContent />}
          </div>
          <div className="h-full z-50">
            {minimized.form ? (
              <div className="flex items-center justify-center z-70 h-full">
                <Button onClick={() => toggleSection("form")}>
                  <ChevronRight size={24} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex p-4 border-b">
                  <h2 className="text-lg font-bold">Nova card</h2>
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
