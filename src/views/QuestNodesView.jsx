// QuestNodesView.jsx
import React, { useRef, useState, useEffect } from "react";
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

export default function QuestNodesView(props) {
  const {
    wallRight,
    filter,
    setFilter,
    onExport,
    onImport,
    missions,
    selectedQuest,
    positions,
    connections,
    pan,
    zoom,
    filtered,
    handlePanStart,
    handlePanMove,
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
    newFaction,
    setNewFaction,
    handleAddFaction,
    newType,
    setNewType,
    hasMovedRef,
    handleAddType,
    connecting,
    setConnecting,
    onStartConnect,
    onRequestDelete,
    deleteId,
    setDeleteId,
    handleDeleteConfirm,
    onAddQuest,
    factions,
    types,
    factionSvgColors,
  } = props;

  // ————————————————————————
  // ESTADOS PARA DETALHES
  const [detailsWindow, setDetailsWindow] = useState(null);
  const [detailsContainer, setDetailsContainer] = useState(null);

  // ESTADOS PARA FORM
  const [formWindow, setFormWindow] = useState(null);
  const [formContainer, setFormContainer] = useState(null);
  // ————————————————————————

  // ————————————————————————
  // LIMPEZA QUANDO JANELA FECHA
  useEffect(() => {
    if (!detailsWindow) return;
    const handleUnload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
    };
    detailsWindow.addEventListener("beforeunload", handleUnload);
    return () =>
      detailsWindow.removeEventListener("beforeunload", handleUnload);
  }, [detailsWindow]);

  useEffect(() => {
    if (!formWindow) return;
    const handleUnload = () => {
      setFormWindow(null);
      setFormContainer(null);
    };
    formWindow.addEventListener("beforeunload", handleUnload);
    return () => formWindow.removeEventListener("beforeunload", handleUnload);
  }, [formWindow]);
  // ————————————————————————

  // ————————————————————————
  // AÇÕES QUE ABREM CADA JANELA
  function openDetailsInNewWindow() {
    if (detailsWindow) return;
    const newWin = window.open("", "_blank", "width=600,height=400");

    // Copia CSS
    const styleSheets = document.querySelectorAll(
      "link[rel='stylesheet'], style"
    );
    styleSheets.forEach((sheet) => {
      newWin.document.head.appendChild(sheet.cloneNode(true));
    });

    // Continua...
    const container = newWin.document.createElement("div");
    newWin.document.body.appendChild(container);
    setDetailsWindow(newWin);
    setDetailsContainer(container);
    toggleSection("details");
    newWin.onbeforeunload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
    };
  }

  function openFormInNewWindow() {
    if (formWindow) return;
    const newWin = window.open("", "_blank", "width=600,height=500");

    // Clonar estilos do HEAD
    const styleSheets = document.querySelectorAll(
      "link[rel='stylesheet'], style"
    );
    styleSheets.forEach((sheet) => {
      newWin.document.head.appendChild(sheet.cloneNode(true));
    });

    // Criar div para portal
    const container = newWin.document.createElement("div");
    newWin.document.body.appendChild(container);

    setFormWindow(newWin);
    setFormContainer(container);
    toggleSection("form"); // Minimiza no principal
  }
  // ————————————————————————
  useEffect(() => {
    if (!detailsWindow) return;
    const handleUnload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
      // Ao fechar, força maximizar a sessão se estiver minimizada
      if (minimized.details) {
        toggleSection("details");
      }
    };
    detailsWindow.addEventListener("beforeunload", handleUnload);
    return () =>
      detailsWindow.removeEventListener("beforeunload", handleUnload);
  }, [detailsWindow, minimized.details]);
  useEffect(() => {
    if (!formWindow) return;
    const handleUnload = () => {
      setFormWindow(null);
      setFormContainer(null);
      if (minimized.form) {
        toggleSection("form");
      }
    };
    formWindow.addEventListener("beforeunload", handleUnload);
    return () => formWindow.removeEventListener("beforeunload", handleUnload);
  }, [formWindow, minimized.form]);

  // ————————————————————————
  // COMPONENTE DE DETALHES
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
                      {val > 0 ? `+${val}` : val}
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
  // ————————————————————————

  // ————————————————————————
  // COMPONENTE DO FORM
  const FormContent = () => (
    <div className="p-4 overflow-auto h-full">
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
          <div className="p-4 space-y-4 border rounded">
            <div className="space-y-2">
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
          </div>
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
    </div>
  );
  // ————————————————————————

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
        <div className="bg-[url('/sprites/sprite2.png')] bg-cover animate-sprite" />
        <div className="flex flex-col justify-center p-4">
          <h1
            className="z-[40] text-2xl font-bold text-white pointer-events-none"
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
          {/* MAPA DE NÓS */}
          <section
            ref={sectionRef}
            className="relative bg-white rounded-lg overflow-visible"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onClick={() => {
              if (!hasMovedRef.current && connecting) setConnecting(null);
            }}
            style={{ height: "calc(100vh - 180px)" }}
          >
            <div
              ref={containerRef}
              className="bg-yellow-50 relative h-full w-full overflow-hidden select-none"
            >
              <svg
                ref={svgRef}
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
                      onClick={(questId) => handleQuestClick(questId)}
                      onStartConnect={(questId) => onStartConnect(questId)}
                      onRequestDelete={(questId) => onRequestDelete(questId)}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* PAINEL DE DETALHES */}
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
            {/* Exibe detalhes APENAS se não tem popup e não está minimizado */}
            {!detailsContainer && !minimized.details && <DetailsContent />}
          </div>

          {/* PAINEL DE FORM */}
          <div className="h-full">
            {minimized.form ? (
              <div className="flex items-center justify-center h-full">
                <Button onClick={() => toggleSection("form")}>
                  <ChevronRight size={24} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-bold">Nova Missão</h2>
                  <Button onClick={openFormInNewWindow}>
                    Abrir em Outra Janela
                  </Button>
                  <Button onClick={() => toggleSection("form")}>
                    <Minimize2 size={16} />
                  </Button>
                </div>
                {/* Se não tem popup e não está minimizado, renderiza aqui */}
                {!formContainer && (
                  <div className="p-4 overflow-auto h-[calc(100%-56px)]">
                    <FormContent />
                  </div>
                )}
              </>
            )}
          </div>
        </ResizableLayout>
      </main>

      {/* Se a popup estiver aberta, mantém o conteúdo lá independentemente de minimizado */}
      {detailsContainer &&
        ReactDOM.createPortal(<DetailsContent />, detailsContainer)}
      {formContainer && ReactDOM.createPortal(<FormContent />, formContainer)}

      {/* MODAL DE EXCLUIR */}
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
