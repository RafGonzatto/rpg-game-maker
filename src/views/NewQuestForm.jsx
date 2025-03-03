// NewQuestForm.jsx
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

const NewQuestForm = ({ onSave, missions = {}, factions = [], types = [] }) => {
  const [q, setQ] = useState({
    id: "",
    title: "",
    faction: "",
    type: "",
    dialogo: "",
    requires: [],
    unlocks: [],
    reputation: {},
  });
  const [filter, setFilter] = useState("");
  const filtered = Object.entries(missions).filter(([, m]) =>
    m.title.toLowerCase().includes(filter.toLowerCase())
  );
  useEffect(() => {
    const formElement = document.getElementById("quest-form");

    const preventPropagation = (e) => {
      e.stopPropagation();
    };

    if (formElement) {
      formElement.addEventListener("mousedown", preventPropagation, true);
      formElement.addEventListener("mousemove", preventPropagation, true);
      formElement.addEventListener("click", preventPropagation, true);
      // Also prevent these events
      formElement.addEventListener("keydown", preventPropagation, true);
      formElement.addEventListener("keyup", preventPropagation, true);

      return () => {
        formElement.removeEventListener("mousedown", preventPropagation, true);
        formElement.removeEventListener("mousemove", preventPropagation, true);
        formElement.removeEventListener("click", preventPropagation, true);
        formElement.removeEventListener("keydown", preventPropagation, true);
        formElement.removeEventListener("keyup", preventPropagation, true);
      };
    }
  }, []);
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
      dialogo: "",
      requires: [],
      unlocks: [],
      reputation: {},
    });
  };
  const StopPropagation = ({ children }) => {
    const stopProp = (e) => {
      e.stopPropagation();
    };

    return (
      <div
        onClick={stopProp}
        onMouseDown={stopProp}
        onMouseMove={stopProp}
        onMouseUp={stopProp}
      >
        {children}
      </div>
    );
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StopPropagation>
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={q.title}
            className="w-full"
            onChange={(e) => setQ({ ...q, title: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col flex-1">
            <Label htmlFor="faction">Facção</Label>
            <select
              id="faction"
              className="w-full p-2 border rounded"
              value={q.faction}
              onChange={(e) => setQ({ ...q, faction: e.target.value })}
              required
            >
              <option value="">Selecione</option>
              {factions.length ? (
                factions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))
              ) : (
                <option disabled>Carregando facções...</option>
              )}
            </select>
          </div>
          <div className="flex flex-col flex-1">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              className="w-full p-2 border rounded"
              value={q.type}
              onChange={(e) => setQ({ ...q, type: e.target.value })}
              required
            >
              <option value="">Selecione</option>
              {types.length ? (
                types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              ) : (
                <option disabled>Carregando tipos...</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="dialogo">Diálogo</Label>
          <textarea
            id="dialogo"
            value={q.dialogo}
            onChange={(e) => setQ({ ...q, dialogo: e.target.value })}
            placeholder="Insira as falas aqui"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <Label>Requisitos</Label>
          <input
            type="text"
            placeholder="Filtrar requisitos"
            className="w-full p-2 border rounded mb-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {Object.keys(missions).length ? (
            <div className="grid grid-cols-2 gap-2">
              {filtered.length ? (
                filtered.map(([id, m]) => (
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
                ))
              ) : (
                <p className="text-gray-500 col-span-2">
                  Nenhum requisito encontrado.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Carregando missões...</p>
          )}
        </div>
        <div>
          <Label>Reputação</Label>
          {factions.length ? (
            <div className="grid grid-cols-3 gap-2">
              {factions.map((f) => (
                <div key={f.name} className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={q.reputation[f.name] || 0}
                    onChange={(e) =>
                      setQ({
                        ...q,
                        reputation: {
                          ...q.reputation,
                          [f.name]: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-20"
                  />
                  <Label className="whitespace-nowrap">{f.name}</Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Carregando facções...</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Adicionar
        </Button>
      </StopPropagation>
    </form>
  );
};

export default NewQuestForm;
