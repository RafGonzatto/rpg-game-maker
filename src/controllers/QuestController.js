///////////////////controllers/QuestController.js

import * as QuestService from "./QuestService";

export const getInitialData = () => QuestService.getInitialData();
export const saveData = (missions, factions, types) =>
  QuestService.saveData(missions, factions, types);
export const exportData = (missions, factions, types) =>
  QuestService.exportData(missions, factions, types);
export const importData = (e, setMissions, setFactions, setTypes) =>
  QuestService.importData(e, setMissions, setFactions, setTypes);
export const addQuest = (prev, quest) => QuestService.addQuest(prev, quest);
export const calculatePositions = (missions) =>
  QuestService.calculatePositions(missions);
