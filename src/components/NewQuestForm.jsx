// src/components/NewQuestForm.jsx
import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

const NewQuestForm = ({ onSave, missions, factions }) => {
  const [q, setQ] = useState({
    id: "",
    title: "",
    faction: "",
    type: "",
    requires: [],
    unlocks: [],
    reputation: {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = q.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    onSave({ ...q, id });
    setQ({
      id: "",
      title: "",
      faction: "",
      type: "",
      requires: [],
      unlocks: [],
      reputation: {},
    });
  };

  const types = [
    "Cutscene",
    "Diálogo",
    "Batalha",
    "Negociação",
    "Recrutamento",
    "Acordo",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={q.title}
          onChange={(e) => setQ({ ...q, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="faction">Facção</Label>
        <select
          id="faction"
          className="w-full p-2 border rounded"
          value={q.faction}
          onChange={(e) => setQ({ ...q, faction: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          {factions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          className="w-full p-2 border rounded"
          value={q.type}
          onChange={(e) => setQ({ ...q, type: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Requisitos</Label>
        {Object.entries(missions).map(([id, m]) => (
          <label key={id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={q.requires.includes(id)}
              onChange={(e) =>
                setQ({
                  ...q,
                  requires: e.target.checked
                    ? [...q.requires, id]
                    : q.requires.filter((r) => r !== id),
                })
              }
            />
            <span>{m.title}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Reputação</Label>
        {factions.map((f) => (
          <div key={f} className="flex items-center space-x-2">
            <Label>{f}</Label>
            <Input
              type="number"
              value={q.reputation[f] || 0}
              onChange={(e) =>
                setQ({
                  ...q,
                  reputation: {
                    ...q.reputation,
                    [f]: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-20"
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full">
        Adicionar
      </Button>
    </form>
  );
};

export default NewQuestForm;
