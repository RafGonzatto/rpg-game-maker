'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QuestNode } from '@/components/quest-node';
import { AnimatedSprite } from '@/components/animations/animated-sprite';
import { BeerAnimated } from '@/components/animations/beer-animated';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Maximize2,
  Minimize2,
  ChevronRight,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Quest {
  id: string;
  title: string;
  faction: string;
  type: string;
  dialogo?: string;
  requires?: string[];
  unlocks?: string[];
  reputation?: Record<string, number>;
}

interface Faction {
  id?: string;
  name: string;
  bgColor: string;
  borderColor: string;
}

interface QuestNodesViewProps {
  quests: Quest[];
  factions: Faction[];
  types: any[];
  isFreePlan: boolean;
  onAddQuest?: (quest: any) => void;
  onUpdateQuest?: (id: string, quest: any) => void;
  onDeleteQuest?: (id: string) => void;
  onAddFaction?: (faction: any) => void;
  onAddType?: (type: string) => void;
}

export function QuestNodesView({
  quests,
  factions,
  types,
  isFreePlan,
  onAddQuest,
  onUpdateQuest,
  onDeleteQuest,
  onAddFaction,
  onAddType,
}: QuestNodesViewProps) {
  const [filter, setFilter] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [minimized, setMinimized] = useState({ details: false, form: false });
  const [wallRight, setWallRight] = useState(200);
  const [verticalDividerPosition, setVerticalDividerPosition] = useState(70);
  const [horizontalDividerPosition, setHorizontalDividerPosition] = useState(60);

  // Form state
  const [formState, setFormState] = useState<Partial<Quest>>({
    title: '',
    faction: '',
    type: '',
    dialogo: '',
    requires: [],
    unlocks: [],
    reputation: {},
  });

  // New faction form
  const [newFaction, setNewFaction] = useState({
    name: '',
    bgColor: '#ffffff',
    borderColor: '#000000',
  });

  // New type
  const [newType, setNewType] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Initialize positions for quests
  useEffect(() => {
    const newPositions: Record<string, { x: number; y: number }> = {};
    quests.forEach((quest, index) => {
      if (!positions[quest.id]) {
        newPositions[quest.id] = {
          x: 100 + (index % 5) * 200,
          y: 100 + Math.floor(index / 5) * 150,
        };
      } else {
        newPositions[quest.id] = positions[quest.id];
      }
    });
    setPositions(newPositions);
  }, [quests, positions]);

  // Update wall position
  useEffect(() => {
    if (wallRef.current) {
      const rect = wallRef.current.getBoundingClientRect();
      setWallRight(rect.right);
    }
  }, []);

  const filtered = quests.filter(quest =>
    quest.title.toLowerCase().includes(filter.toLowerCase())
  );

  const handleQuestClick = (questId: string) => {
    if (connecting) {
      if (connecting !== questId) {
        // Create connection
        setConnections(prev => [...prev, { from: connecting, to: questId }]);
        toast.success('Conexão criada!');
      }
      setConnecting(null);
    } else {
      setSelectedQuest(questId);
    }
  };

  const handleConnect = (questId: string) => {
    setConnecting(questId);
    toast('Selecione outra missão para conectar');
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPanPoint]);

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.9, 0.3));
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title || !formState.faction || !formState.type) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const id = formState.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const quest: Quest = {
      id,
      title: formState.title,
      faction: formState.faction,
      type: formState.type,
      dialogo: formState.dialogo || '',
      requires: formState.requires || [],
      unlocks: formState.unlocks || [],
      reputation: formState.reputation || {},
    };

    if (onAddQuest) {
      onAddQuest(quest);
      toast.success('Missão criada com sucesso!');
      setFormState({
        title: '',
        faction: '',
        type: '',
        dialogo: '',
        requires: [],
        unlocks: [],
        reputation: {},
      });
    }
  };

  const handleAddFaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaction.name) {
      toast.error('Nome da facção é obrigatório');
      return;
    }

    if (onAddFaction) {
      onAddFaction(newFaction);
      toast.success('Facção adicionada com sucesso!');
      setNewFaction({
        name: '',
        bgColor: '#ffffff',
        borderColor: '#000000',
      });
    }
  };

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType) {
      toast.error('Nome do tipo é obrigatório');
      return;
    }

    if (onAddType) {
      onAddType(newType);
      toast.success('Tipo adicionado com sucesso!');
      setNewType('');
    }
  };

  const exportMissions = () => {
    const data = {
      quests,
      factions,
      types,
      positions,
      connections,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quest-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const importMissions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.positions) setPositions(data.positions);
        if (data.connections) setConnections(data.connections);
        toast.success('Dados importados com sucesso!');
      } catch (error) {
        toast.error('Erro ao importar dados');
      }
    };
    reader.readAsText(file);
  };

  const getFaction = (factionName: string) => {
    return factions.find(f => f.name === factionName) || {
      name: factionName,
      bgColor: '#ffffff',
      borderColor: '#000000',
    };
  };

  const buildConnectionPath = (from: string, to: string) => {
    const fromPos = positions[from];
    const toPos = positions[to];
    if (!fromPos || !toPos) return '';

    const startX = fromPos.x + 100;
    const startY = fromPos.y + 50;
    const endX = toPos.x;
    const endY = toPos.y + 50;

    return `M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 50} ${endX} ${endY}`;
  };

  const toggleSection = (section: 'details' | 'form') => {
    setMinimized(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-yellow-800 overflow-hidden">
      {/* Medieval Header with Animations */}
      <header
        ref={headerRef}
        className="relative bg-rose-600 h-[20vh] grid grid-cols-4"
      >
        <AnimatedSprite />
        
        {/* Board at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[10%]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url(/images/board.png)",
              imageRendering: "pixelated",
              backgroundSize: "auto 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "bottom",
            }}
          />
        </div>
        
        <BeerAnimated />
        
        {/* Wall */}
        <div
          ref={wallRef}
          className="pointer-events-none absolute left-[15%] top-0 w-full h-[90%]"
          style={{ zIndex: 5 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url(/images/wall.png)",
              imageRendering: "pixelated",
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        
        <div />
        
        {/* Title and Controls */}
        <div className="flex flex-col z-50 justify-center p-4">
          <h1
            className="z-[40] text-2xl font-bold text-white drop-shadow-lg"
            style={{ position: "absolute", left: Math.max(wallRight + 10, 300), top: 10 }}
          >
            Quest Visualizer
          </h1>
          <div
            className="relative flex items-center gap-4"
            style={{ position: "absolute", left: Math.max(wallRight + 10, 300), top: 50 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="   Filtrar missões..."
                className="pl-10 bg-amber-50"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button onClick={exportMissions} className="bg-amber-600 hover:bg-amber-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importMissions}
              id="file-input-nodes"
            />
            <Button
              onClick={() => document.getElementById("file-input-nodes")?.click()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Quest Graph Area */}
        <div 
          className="flex-1 relative bg-yellow-50"
          style={{ width: `${verticalDividerPosition}%` }}
        >
          <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
          >
            {/* SVG for connections */}
            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                </marker>
              </defs>
              {connections.map((conn, index) => (
                <path
                  key={index}
                  d={buildConnectionPath(conn.from, conn.to)}
                  stroke="#4B5563"
                  strokeWidth={2}
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              ))}
            </svg>

            {/* Controls */}
            <div className="absolute top-4 left-4 flex gap-2 z-[100]">
              <Button onClick={handleZoomIn} size="sm">
                <ZoomIn size={16} />
              </Button>
              <Button onClick={handleZoomOut} size="sm">
                <ZoomOut size={16} />
              </Button>
              <Button onClick={handleReset} size="sm">
                <Home size={16} />
              </Button>
              {connecting && (
                <Button onClick={() => setConnecting(null)} variant="outline" size="sm">
                  Cancelar Conexão
                </Button>
              )}
            </div>

            {/* Quest Nodes */}
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {filtered.map((quest) => (
                <QuestNode
                  key={quest.id}
                  quest={quest}
                  position={positions[quest.id] || { x: 0, y: 0 }}
                  faction={getFaction(quest.faction)}
                  onClick={() => handleQuestClick(quest.id)}
                  onConnect={() => handleConnect(quest.id)}
                  isSelected={selectedQuest === quest.id}
                  connecting={connecting === quest.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div 
          className="bg-white border-l flex flex-col"
          style={{ width: `${100 - verticalDividerPosition}%` }}
        >
          {/* Quest Details */}
          <div 
            className="border-b"
            style={{ height: `${horizontalDividerPosition}%` }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Detalhes da Missão</h3>
              <Button onClick={() => toggleSection('details')} size="sm" variant="ghost">
                {minimized.details ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
            </div>
            {!minimized.details && (
              <div className="p-4 overflow-auto h-[calc(100%-60px)]">
                {selectedQuest && quests.find(q => q.id === selectedQuest) ? (
                  <QuestDetails quest={quests.find(q => q.id === selectedQuest)!} />
                ) : (
                  <p className="text-gray-500">Selecione uma missão para ver os detalhes</p>
                )}
              </div>
            )}
          </div>

          {/* Quest Form */}
          <div className="flex-1">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Nova Missão</h3>
              <Button onClick={() => toggleSection('form')} size="sm" variant="ghost">
                {minimized.form ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
            </div>
            {!minimized.form && (
              <div className="p-4 overflow-auto h-[calc(100%-60px)]">
                <QuestForm
                  formState={formState}
                  setFormState={setFormState}
                  factions={factions}
                  types={types}
                  quests={quests}
                  onSubmit={handleSubmit}
                  onAddFaction={handleAddFaction}
                  onAddType={handleAddType}
                  newFaction={newFaction}
                  setNewFaction={setNewFaction}
                  newType={newType}
                  setNewType={setNewType}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Quest Details Component
function QuestDetails({ quest }: { quest: Quest }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-lg">{quest.title}</h4>
        <p className="text-gray-600">{quest.faction} • {quest.type}</p>
      </div>
      
      {quest.dialogo && (
        <div>
          <h5 className="font-medium">Diálogo:</h5>
          <p className="text-gray-700 mt-1">{quest.dialogo}</p>
        </div>
      )}
      
      {quest.requires && quest.requires.length > 0 && (
        <div>
          <h5 className="font-medium">Requisitos:</h5>
          <ul className="list-disc list-inside mt-1">
            {quest.requires.map((req, index) => (
              <li key={index} className="text-gray-700">{req}</li>
            ))}
          </ul>
        </div>
      )}
      
      {quest.unlocks && quest.unlocks.length > 0 && (
        <div>
          <h5 className="font-medium">Desbloqueia:</h5>
          <ul className="list-disc list-inside mt-1">
            {quest.unlocks.map((unlock, index) => (
              <li key={index} className="text-gray-700">{unlock}</li>
            ))}
          </ul>
        </div>
      )}
      
      {quest.reputation && Object.keys(quest.reputation).length > 0 && (
        <div>
          <h5 className="font-medium">Reputação:</h5>
          <div className="mt-1">
            {Object.entries(quest.reputation).map(([faction, rep]) => (
              <div key={faction} className="flex justify-between">
                <span>{faction}:</span>
                <span className={rep > 0 ? 'text-green-600' : rep < 0 ? 'text-red-600' : ''}>{rep}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Quest Form Component
interface QuestFormProps {
  formState: Partial<Quest>;
  setFormState: React.Dispatch<React.SetStateAction<Partial<Quest>>>;
  factions: Faction[];
  types: any[];
  quests: Quest[];
  onSubmit: (e: React.FormEvent) => void;
  onAddFaction: (e: React.FormEvent) => void;
  onAddType: (e: React.FormEvent) => void;
  newFaction: { name: string; bgColor: string; borderColor: string };
  setNewFaction: React.Dispatch<React.SetStateAction<{ name: string; bgColor: string; borderColor: string }>>;
  newType: string;
  setNewType: React.Dispatch<React.SetStateAction<string>>;
}

function QuestForm({
  formState,
  setFormState,
  factions,
  types,
  quests,
  onSubmit,
  onAddFaction,
  onAddType,
  newFaction,
  setNewFaction,
  newType,
  setNewType,
}: QuestFormProps) {
  return (
    <div className="space-y-6">
      {/* Quest Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Título *</Label>
          <Input
            required
            value={formState.title || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Facção *</Label>
            <select
              required
              className="w-full p-2 border rounded"
              value={formState.faction || ''}
              onChange={(e) => setFormState(prev => ({ ...prev, faction: e.target.value }))}
            >
              <option value="">Selecione</option>
              {factions.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Tipo *</Label>
            <select
              required
              className="w-full p-2 border rounded"
              value={formState.type || ''}
              onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Selecione</option>
              {types.map((t) => (
                <option key={typeof t === 'string' ? t : t.name} value={typeof t === 'string' ? t : t.name}>
                  {typeof t === 'string' ? t : t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Diálogo</Label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={formState.dialogo || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, dialogo: e.target.value }))}
          />
        </div>

        <Button type="submit" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Missão
        </Button>
      </form>

      {/* Faction Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerenciar Facções</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddFaction} className="space-y-3">
            <Input
              placeholder="Nome da facção"
              value={newFaction.name}
              onChange={(e) => setNewFaction(prev => ({ ...prev, name: e.target.value }))}
            />
            <Button type="submit" size="sm" className="w-full">
              Adicionar Facção
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Type Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerenciar Tipos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddType} className="space-y-3">
            <Input
              placeholder="Nome do tipo"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
            <Button type="submit" size="sm" className="w-full">
              Adicionar Tipo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
