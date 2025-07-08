// // NewQuestForm.jsx
// import React from "react";
// import { Button } from "../components/ui/Button";
// import { Input } from "../components/ui/Input";
// import { Label } from "../components/ui/Label";
// import { useSession } from "next-auth/react";
// import { useCreateQuest } from "../hooks/use-quest-api";

// const NewQuestForm = ({
//   onSave,
//   missions = {},
//   factions = [],
//   types = [],
//   formState,
//   setFormState,
// }) => {
//   const [filter, setFilter] = React.useState("");
//   const { data: session } = useSession();
//   const isPremium = session?.user?.plan === "PREMIUM";
//   const {
//     mutate: createQuest,
//     isLoading,
//     isError,
//     error,
//     isSuccess,
//   } = useCreateQuest();

//   const filtered = Object.entries(missions).filter(([, m]) =>
//     m.title.toLowerCase().includes(filter.toLowerCase())
//   );

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const id = formState.title
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "_")
//       .replace(/^_+|_+$/g, "");
//     const questData = { ...formState, id };
//     if (isPremium) {
//       createQuest(questData);
//     } else if (onSave) {
//       onSave(questData);
//     }
//     setFormState({
//       id: "",
//       title: "",
//       faction: "",
//       type: "",
//       dialogo: "",
//       requires: [],
//       unlocks: [],
//       reputation: {},
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <Label htmlFor="title">Título</Label>
//         <Input
//           id="title"
//           value={formState.title}
//           className="w-full"
//           onChange={(e) =>
//             setFormState((prev) => ({ ...prev, title: e.target.value }))
//           }
//           required
//         />
//       </div>
//       <div className="flex gap-2">
//         <div className="flex flex-col flex-1">
//           <Label htmlFor="faction">Facção</Label>
//           <select
//             id="faction"
//             className="w-full p-2 border rounded"
//             value={formState.faction}
//             onChange={(e) =>
//               setFormState((prev) => ({ ...prev, faction: e.target.value }))
//             }
//             required
//           >
//             <option value="">Selecione</option>
//             {factions.map((f) => (
//               <option key={f.name} value={f.name}>
//                 {f.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="flex flex-col flex-1">
//           <Label htmlFor="type">Tipo</Label>
//           <select
//             id="type"
//             className="w-full p-2 border rounded"
//             value={formState.type}
//             onChange={(e) =>
//               setFormState((prev) => ({ ...prev, type: e.target.value }))
//             }
//             required
//           >
//             <option value="">Selecione</option>
//             {types.map((t) => (
//               <option key={t} value={t}>
//                 {t}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//       <div>
//         <Label htmlFor="dialogo">Diálogo</Label>
//         <textarea
//           id="dialogo"
//           value={formState.dialogo}
//           onChange={(e) =>
//             setFormState((prev) => ({ ...prev, dialogo: e.target.value }))
//           }
//           className="w-full p-2 border rounded"
//           placeholder="Insira as falas aqui"
//         />
//       </div>
//       <div>
//         <Label>Requisitos</Label>
//         <input
//           type="text"
//           placeholder="Filtrar requisitos"
//           className="w-full p-2 border rounded mb-2"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         />
//         <div className="grid grid-cols-2 gap-2">
//           {filtered.map(([id, m]) => (
//             <label key={id} className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={formState.requires.includes(id)}
//                 onChange={(e) =>
//                   setFormState((prev) => ({
//                     ...prev,
//                     requires: e.target.checked
//                       ? [...prev.requires, id]
//                       : prev.requires.filter((r) => r !== id),
//                   }))
//                 }
//               />
//               <span>{m.title}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//       <div>
//         <Label>Reputação</Label>
//         <div className="grid grid-cols-3 gap-2">
//           {factions.map((f) => (
//             <div key={f.name} className="flex items-center space-x-2">
//               <Input
//                 type="number"
//                 value={formState.reputation[f.name] || 0}
//                 onChange={(e) =>
//                   setFormState((prev) => ({
//                     ...prev,
//                     reputation: {
//                       ...prev.reputation,
//                       [f.name]: parseInt(e.target.value) || 0,
//                     },
//                   }))
//                 }
//                 className="w-20"
//               />
//               <Label>{f.name}</Label>
//             </div>
//           ))}
//         </div>
//       </div>
//       <Button type="submit" className="w-full" disabled={isLoading}>
//         {isLoading
//           ? "Salvando..."
//           : formState.id
//           ? "Atualizar Missão"
//           : "Adicionar Missão"}
//       </Button>
//       {isError && (
//         <div className="text-red-500 text-sm mt-2">
//           Erro ao salvar: {error?.message || "Tente novamente."}
//         </div>
//       )}
//       {isSuccess && (
//         <div className="text-green-600 text-sm mt-2">
//           Missão salva com sucesso!
//         </div>
//       )}
//     </form>
//   );
// };

// export default NewQuestForm;
