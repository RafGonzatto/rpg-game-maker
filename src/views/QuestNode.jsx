import React from "react";
import { Link, Trash2 } from "lucide-react";

const CARD_WIDTH = 240;
const CARD_HEIGHT = 130;

export const QuestNode = React.memo(function QuestNode({
  quest,
  selected,
  pos,
  onClick,
  onStartConnect,
  onRequestDelete,
  factionConfig,
}) {
  return (
    <div
      className={`absolute p-4 rounded-lg border-2 shadow-lg cursor-pointer transition-all ${
        selected ? "ring-4 ring-purple-500 scale-105" : ""
      }`}
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex: selected ? 100 : 1,
        width: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
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

        {/* Aqui usamos a cor de fundo ou qualquer outra que você passar */}
        <span
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: factionConfig?.bgColor || "#fff" }}
        >
          Facção: {quest.faction}
        </span>
      </div>

      {/* Botões de conectar/excluir só aparecem se estiver selecionado */}
      {selected && (
        <div className="absolute -right-11 z-50 top-1/2 flex flex-col gap-2">
          <div
            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(quest.id);
            }}
          >
            <Link size={16} />
          </div>

          <div
            className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(quest.id);
            }}
          >
            <Trash2 size={16} />
          </div>
        </div>
      )}
    </div>
  );
});
