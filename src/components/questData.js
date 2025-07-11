///////////////////////////////////////////////// questData.js
export const questData = {
  missions: {
    intro_dialogue: {
      id: "intro_dialogue",
      title: "Apresentação do Jogo",
      faction: "Tutorial",
      type: "Cutscene",
      requires: [],
      unlocks: ["marombastimaco_encounter"],
      reputation: {},
    },
    marombastimaco_encounter: {
      id: "marombastimaco_encounter",
      title: "Proposta do Marombastimaco",
      faction: "Gangue Rival",
      type: "Diálogo",
      requires: ["intro_dialogue"],
      unlocks: ["rival_gang_leader_fight", "rival_gang_negotiation"],
      choices: {
        reject: "Sai fora bundudu...",
        accept: "Vale a pena o risco...",
        think: "Tenho que pensar ainda...",
      },
      reputation: { rival_gang: 5 },
    },
    rival_gang_leader_fight: {
      id: "rival_gang_leader_fight",
      title: "Confronto com Líder Rival",
      faction: "Combate",
      type: "Batalha",
      requires: ["marombastimaco_encounter"],
      unlocks: ["marombastimaco_recruitment"],
      choices: {
        direct_combat: "Vai fugir mandando esses bostolhos...",
        betray_marombastimaco: "Calma, podemos lavar nossas mãos...",
        negotiate: "Vim falar de negócios...",
      },
      reputation: { rival_gang: -20, player_gang: 15 },
    },
    rival_gang_negotiation: {
      id: "rival_gang_negotiation",
      title: "Negociação com Rival",
      faction: "Diplomacia",
      type: "Diálogo",
      requires: ["marombastimaco_encounter"],
      unlocks: ["business_deal", "surprise_attack"],
      choices: {
        propose_alliance: "Preciso de recursos...",
        start_fight: "O segundo negócio mais antigo...",
      },
      reputation: { rival_gang: 10, player_gang: 5 },
    },
    marombastimaco_recruitment: {
      id: "marombastimaco_recruitment",
      title: "Recrutamento do Marombastimaco",
      faction: "Aliados",
      type: "Recrutamento",
      requires: ["rival_gang_leader_fight"],
      unlocks: [],
      reputation: { player_gang: 20, rival_gang: -10 },
    },
    business_deal: {
      id: "business_deal",
      title: "Acordo Comercial",
      faction: "Negócios",
      type: "Acordo",
      requires: ["rival_gang_negotiation"],
      unlocks: [],
      reputation: { rival_gang: 15, player_gang: 10 },
    },
    surprise_attack: {
      id: "surprise_attack",
      title: "Ataque Surpresa",
      faction: "Combate",
      type: "Batalha",
      requires: ["rival_gang_negotiation"],
      unlocks: [],
      reputation: { rival_gang: -30, player_gang: 25 },
    },
  },
  factions: [
    "Tutorial",
    "Gangue Rival",
    "Combate",
    "Diplomacia",
    "Aliados",
    "Negócios",
  ],
};

export const factionColors = {
  Tutorial: "bg-gray-100 border-gray-500",
  "Gangue Rival": "bg-red-100 border-red-500",
  Combate: "bg-orange-100 border-orange-500",
  Diplomacia: "bg-blue-100 border-blue-500",
  Aliados: "bg-green-100 border-green-500",
  Negócios: "bg-purple-100 border-purple-500",
};
