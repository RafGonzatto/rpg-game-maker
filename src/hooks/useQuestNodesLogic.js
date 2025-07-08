// useQuestNodesLogic.js
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useTreeLayout from "../hooks/useTreeLayout";
import { CARD_WIDTH, CARD_HEIGHT, MIN_ZOOM, MAX_ZOOM } from "../constants";

export default function useQuestNodesLogic({
  missions,
  setMissions,
  factions,
  setFactions,
  types,
  setTypes,
  selectedQuest,
  setSelectedQuest,
}) {
  const headerRef = useRef(null),
    wallRef = useRef(null),
    containerRef = useRef(null),
    sectionRef = useRef(null),
    svgRef = useRef(null);

  const [wallRight, setWallRight] = useState(0);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const [filter, setFilter] = useState("");
  const [isPanning, setIsPanning] = useState(false);

  const [verticalDividerPosition, setVerticalDividerPosition] = useState(70);
  const [horizontalDividerPosition, setHorizontalDividerPosition] =
    useState(60);
  const [minimized, setMinimized] = useState({ form: false, details: false });
  const [previousPositions, setPreviousPositions] = useState({
    vertical: 70,
    horizontal: 60,
  });

  const [detailsWindow, setDetailsWindow] = useState(null);
  const [detailsContainer, setDetailsContainer] = useState(null);
  const [formWindow, setFormWindow] = useState(null);
  const [formContainer, setFormContainer] = useState(null);

  const [newFaction, setNewFaction] = useState({
    name: "",
    bgColor: "#ffffff",
    borderColor: "#000000",
  });
  const [newType, setNewType] = useState("");

  const factionSvgColors = useMemo(
    () => ({
      "Gangue Rival": "#ef4444",
      Negócios: "#3b82f6",
      Combate: "#10b981",
      Tutorial: "#f59e0b",
      Diplomacia: "#6366f1",
      Aliados: "#8b5cf6",
    }),
    []
  );

  // Layout
  const { positions, connections, filtered } = useTreeLayout(
    missions,
    zoom,
    pan,
    filter,
    factions.reduce((acc, f) => ({ ...acc, [f.name]: f.bgColor }), {})
  );

  // Pan e Zoom
  const handlePanStart = (e) => {
    if (
      e.target.closest(
        "input,select,textarea,button,.no-pan,[contenteditable='true']"
      )
    )
      return;
    setIsPanning(true);
    setPan((p) => ({
      ...p,
      startX: e.clientX - p.x,
      startY: e.clientY - p.y,
    }));
  };
  const handlePanMove = (e) => {
    if (!isPanning) return;
    setPan((p) => ({ ...p, x: e.clientX - p.startX, y: e.clientY - p.startY }));
  };
  const handlePanEnd = () => setIsPanning(false);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.2 : 0.8;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor)));
  }, []);
  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2));

  const handleReset = useCallback(() => {
    setZoom(1);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - CARD_WIDTH / 2,
        y: 50,
        startX: 0,
        startY: 0,
      });
    }
  }, []);

  // Ajusta imagem do muro
  useEffect(() => {
    const measure = () => {
      requestAnimationFrame(() => {
        if (!headerRef.current || !wallRef.current) return;
        const headerRect = headerRef.current.getBoundingClientRect();
        const wallRect = wallRef.current.getBoundingClientRect();
        const wallHeight = wallRef.current.clientHeight;
        const img = new Image();
        img.src = "../src/images/wall.png";
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          setWallRight(wallRect.left - headerRect.left + wallHeight * ratio);
        };
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Centraliza na primeira montagem (quando posições carregam)
  const [initializedCenter, setInitializedCenter] = useState(false);
  useEffect(() => {
    if (!initializedCenter && Object.keys(positions).length) {
      setInitializedCenter(true);
      handleReset();
    }
  }, [positions, handleReset, initializedCenter]);

  // Eventos mouse
  useEffect(() => {
    const mm = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const mu = () => setIsPanning(false);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, []);

  // Roda do mouse
  useEffect(() => {
    const section = sectionRef.current;
    if (section) {
      section.addEventListener("wheel", handleWheel, {
        passive: false,
      });
      return () => section.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Minimize
  useEffect(() => {
    setMinimized({
      details: horizontalDividerPosition > 90,
      form: verticalDividerPosition > 93,
    });
  }, [verticalDividerPosition, horizontalDividerPosition]);

  // Conexão temporária
  const buildTempConnection = () => {
    if (!connecting || !positions[connecting] || !svgRef.current) return "";
    const svgRect = svgRef.current.getBoundingClientRect();
    const mx = mousePos.x - svgRect.left;
    const my = mousePos.y - svgRect.top;
    const sx = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x;
    const sy = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y;
    return `M ${sx} ${sy} L ${mx} ${my}`;
  };

  // Evita loop
  const hasPath = (m, from, to, visited = new Set()) => {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    return m[from]?.unlocks?.some((n) => hasPath(m, n, to, visited));
  };

  // Clique no nó
  const handleQuestClick = (id) => {
    if (connecting && connecting !== id) {
      if (hasPath(missions, id, connecting)) {
        alert("Loop de dependências!");
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
    } else {
      setSelectedQuest(id);
    }
  };

  // Excluir
  const handleDeleteConfirm = () => {
    const newM = { ...missions };
    Object.values(newM).forEach((q) => {
      q.requires = q.requires.filter((r) => r !== deleteId);
      q.unlocks = q.unlocks.filter((u) => u !== deleteId);
    });
    delete newM[deleteId];
    setMissions(newM);
    if (selectedQuest === deleteId) setSelectedQuest(null);
    setDeleteId(null);
  };

  // Facções e Tipos
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

  // Janela externa de detalhes
  const openDetailsInNewWindow = () => {
    if (detailsWindow) return;
    const nw = window.open("", "_blank", "width=600,height=400");
    document
      .querySelectorAll("link[rel='stylesheet'], style")
      .forEach((s) => nw.document.head.appendChild(s.cloneNode(true)));
    const container = nw.document.createElement("div");
    nw.document.body.appendChild(container);
    setDetailsWindow(nw);
    setDetailsContainer(container);
    toggleSection("details");
    nw.onbeforeunload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
    };
  };

  // Janela externa form
  const openFormInNewWindow = () => {
    if (formWindow) return;
    const nw = window.open("", "_blank", "width=600,height=500");
    document
      .querySelectorAll("link[rel='stylesheet'], style")
      .forEach((s) => nw.document.head.appendChild(s.cloneNode(true)));
    const container = nw.document.createElement("div");
    nw.document.body.appendChild(container);
    setFormWindow(nw);
    setFormContainer(container);
    toggleSection("form");
  };

  // Fecha janela externa detalhes
  // Remove duplicate declaration of toggleSection. The original implementation should be kept below.

  useEffect(() => {
    if (!detailsWindow) return;
    const onUnload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
      if (minimized.details) toggleSection("details");
    };
    detailsWindow.addEventListener("beforeunload", onUnload);
    return () => detailsWindow.removeEventListener("beforeunload", onUnload);
  }, [detailsWindow, minimized.details, toggleSection]);

  // Fecha janela externa form
  useEffect(() => {
    if (!formWindow) return;
    const onUnload = () => {
      setFormWindow(null);
      setFormContainer(null);
      if (minimized.form) toggleSection("form");
    };
    formWindow.addEventListener("beforeunload", onUnload);
    return () => formWindow.removeEventListener("beforeunload", onUnload);
  }, [formWindow, minimized.form, toggleSection]);

  // Minimiza seções
  const toggleSection = useCallback(
    (section) => {
      if (section === "details") {
        if (minimized.details) {
          setHorizontalDividerPosition(previousPositions.horizontal);
        } else {
          setPreviousPositions((p) => ({
            ...p,
            horizontal: horizontalDividerPosition,
          }));
          setHorizontalDividerPosition(95);
        }
        setMinimized((p) => ({ ...p, details: !p.details }));
      }
      if (section === "form") {
        if (minimized.form) {
          setVerticalDividerPosition(previousPositions.vertical);
        } else {
          setPreviousPositions((p) => ({
            ...p,
            vertical: verticalDividerPosition,
          }));
          setVerticalDividerPosition(98);
        }
        setMinimized((p) => ({ ...p, form: !p.form }));
      }
    },
    [minimized, previousPositions, horizontalDividerPosition, verticalDividerPosition]
  );

  // Exportar/Importar JSON
  const exportMissions = () => {
    const data = JSON.stringify(missions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "missions.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };
  const importMissions = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setMissions(JSON.parse(evt.target.result));
    };
    reader.readAsText(file);
  };

  // Salvar Missão
  const saveMission = useCallback(
    (newQuest) => {
      setMissions((prev) => ({
        ...prev,
        [newQuest.id]: { ...newQuest, unlocks: newQuest.unlocks || [] },
      }));
      setSelectedQuest(null);
    },
    [setMissions, setSelectedQuest]
  );

  return {
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
  };
}
