import React, { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Button } from "../components/ui/Button.js";
import { questData, factionColors } from "../components/questData";
//import NewQuestForm from "./NewQuestForm.js";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 92;

const hasPath = (missions, from, to, visited = new Set()) => {
  if (from === to) return true;
  if (visited.has(from)) return false;
  visited.add(from);
  return missions[from]?.unlocks?.some((nx) =>
    hasPath(missions, nx, to, visited)
  );
};

export default function QuestGraphView({
  missions,
  setMissions,
  selectedQuest,
  setSelectedQuest,
  onExport,
  onImport,
  onAddQuest,
}) {
  // ...restante do código...
}
