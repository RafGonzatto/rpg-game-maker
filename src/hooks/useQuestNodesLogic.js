//////useQuestNodesLogic.js
import { useState, useEffect, useRef, useMemo } from "react";
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
  const headerRef = useRef(null);
  const wallRef = useRef(null);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const hasMovedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const [wallRight, setWallRight] = useState(0);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    active: false,
  });
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

  function onStartConnect(questId) {
    setConnecting(questId);
  }

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

  const { positions, connections, filtered } = useTreeLayout(
    missions,
    zoom,
    pan,
    filter,
    factions.reduce((acc, f) => ({ ...acc, [f.name]: f.bgColor }), {})
  );

  function toggleSection(section) {
    if (section === "details") {
      if (minimized.details) {
        setHorizontalDividerPosition(previousPositions.horizontal);
      } else {
        setPreviousPositions((prev) => ({
          ...prev,
          horizontal: horizontalDividerPosition,
        }));
        setHorizontalDividerPosition(95);
      }
      setMinimized((prev) => ({ ...prev, details: !prev.details }));
    } else if (section === "form") {
      if (minimized.form) {
        setVerticalDividerPosition(previousPositions.vertical);
      } else {
        setPreviousPositions((prev) => ({
          ...prev,
          vertical: verticalDividerPosition,
        }));
        setVerticalDividerPosition(98);
      }
      setMinimized((prev) => ({ ...prev, form: !prev.form }));
    }
  }

  const handlePanStart = (e) => {
    // Set panning to true
    setIsPanning(true);
    setPan({
      ...pan,
      startX: e.clientX - pan.x,
      startY: e.clientY - pan.y,
    });
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;

    setPan({
      ...pan,
      x: e.clientX - pan.startX,
      y: e.clientY - pan.startY,
    });
  };

  const handleReset = () => {
    setZoom(1);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2 - CARD_WIDTH / 2, y: 50 });
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2));

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, zoom * (1 - e.deltaY * 0.001))
    );
    setZoom(newZoom);
  };

  useEffect(() => {
    handleReset();
  }, []);
  useEffect(() => {
    const isDetailsMinimized = horizontalDividerPosition > 90;
    const isFormMinimized = verticalDividerPosition > 93;
    setMinimized({ details: isDetailsMinimized, form: isFormMinimized });
  }, [verticalDividerPosition, horizontalDividerPosition]);
  useEffect(() => {
    const measure = () => {
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
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => setIsPanning(false));
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => setIsPanning(false));
    };
  }, []);
  useEffect(() => {
    sectionRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => sectionRef.current?.removeEventListener("wheel", handleWheel);
  }, []);

  const buildTempConnection = () => {
    if (!connecting || !positions[connecting] || !svgRef.current) return "";
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = mousePos.x - svgRect.left;
    const mouseY = mousePos.y - svgRect.top;
    const startX = (positions[connecting].x + CARD_WIDTH / 2) * zoom + pan.x;
    const startY = (positions[connecting].y + CARD_HEIGHT / 2) * zoom + pan.y;
    return `M ${startX} ${startY} L ${mouseX} ${mouseY}`;
  };

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
  const handlePanEnd = () => {
    setIsPanning(false);
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

  const [newFaction, setNewFaction] = useState({
    name: "",
    bgColor: "#ffffff",
    borderColor: "#000000",
  });
  const [newType, setNewType] = useState("");

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

  const openDetailsInNewWindow = () => {
    if (detailsWindow) return;
    const newWin = window.open("", "_blank", "width=600,height=400");
    document
      .querySelectorAll("link[rel='stylesheet'], style")
      .forEach((sheet) => {
        newWin.document.head.appendChild(sheet.cloneNode(true));
      });
    const container = newWin.document.createElement("div");
    newWin.document.body.appendChild(container);
    setDetailsWindow(newWin);
    setDetailsContainer(container);
    toggleSection("details");
    newWin.onbeforeunload = () => {
      setDetailsWindow(null);
      setDetailsContainer(null);
    };
  };
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

  const openFormInNewWindow = () => {
    if (formWindow) return;
    const newWin = window.open("", "_blank", "width=600,height=500");
    document
      .querySelectorAll("link[rel='stylesheet'], style")
      .forEach((sheet) => {
        newWin.document.head.appendChild(sheet.cloneNode(true));
      });
    const container = newWin.document.createElement("div");
    newWin.document.body.appendChild(container);
    setFormWindow(newWin);
    setFormContainer(container);
    toggleSection("form");
  };

  return {
    wallRight,
    filter,
    setFilter,
    onExport: () => {},
    onImport: () => {},
    missions,
    selectedQuest,
    positions,
    hasMovedRef,
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
    handleDeleteConfirm,
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
    newFaction,
    setNewFaction,
    handleAddFaction,
    newType,
    setNewType,
    handleAddType,
    factionSvgColors,
    connecting,
    setConnecting,
    handlePanEnd,
    onStartConnect,
    isPanning,
  };
}
