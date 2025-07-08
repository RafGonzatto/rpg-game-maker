'use client'

import React from 'react';

interface QuestNodeProps {
  quest: {
    id: string;
    title: string;
    faction: string;
    type: string;
    dialogo?: string;
    requires?: string[];
    unlocks?: string[];
    reputation?: Record<string, number>;
  };
  position: { x: number; y: number };
  faction: {
    name: string;
    bgColor: string;
    borderColor: string;
  };
  onClick: () => void;
  onConnect?: () => void;
  isSelected?: boolean;
  connecting?: boolean;
}

export function QuestNode({ 
  quest, 
  position, 
  faction, 
  onClick, 
  onConnect, 
  isSelected = false,
  connecting = false 
}: QuestNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connecting && onConnect) {
      onConnect();
    } else {
      onClick();
    }
  };

  return (
    <div
      className={`absolute quest-node cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isSelected ? 'selected ring-4 ring-blue-500 ring-opacity-50' : ''
      } ${
        connecting ? 'connecting ring-2 ring-yellow-500 ring-opacity-75' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: faction.bgColor,
        borderColor: faction.borderColor,
        borderWidth: '3px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '120px',
        maxWidth: '200px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: isSelected ? 20 : 10,
      }}
      onClick={handleClick}
      title={`${quest.title} (${quest.faction} - ${quest.type})`}
    >
      <div className="text-sm font-semibold text-amber-900 mb-1 line-clamp-2">
        {quest.title}
      </div>
      <div className="text-xs text-amber-700 mb-1">
        {quest.faction}
      </div>
      <div className="text-xs text-amber-600 italic">
        {quest.type}
      </div>
      
      {quest.dialogo && (
        <div className="text-xs text-amber-600 mt-1 truncate" title={quest.dialogo}>
          "{quest.dialogo.substring(0, 30)}{quest.dialogo.length > 30 ? '...' : ''}"
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        {quest.requires && quest.requires.length > 0 && (
          <div className="text-xs text-red-600" title={`Requires: ${quest.requires.join(', ')}`}>
            ⚠️ {quest.requires.length}
          </div>
        )}
        
        {quest.unlocks && quest.unlocks.length > 0 && (
          <div className="text-xs text-green-600" title={`Unlocks: ${quest.unlocks.join(', ')}`}>
            🔓 {quest.unlocks.length}
          </div>
        )}
        
        {connecting && (
          <div className="text-xs text-blue-600 font-bold">
            🔗 Connect
          </div>
        )}
      </div>
      
      {quest.reputation && Object.keys(quest.reputation).length > 0 && (
        <div className="text-xs mt-1">
          {Object.entries(quest.reputation).map(([fac, rep]) => (
            <span
              key={fac}
              className={`inline-block mr-1 px-1 rounded ${
                rep > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
              title={`${fac}: ${rep > 0 ? '+' : ''}${rep}`}
            >
              {fac}: {rep > 0 ? '+' : ''}{rep}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
