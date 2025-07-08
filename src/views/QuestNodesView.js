// QuestNodesView.js
import React, { useState, useCallback, memo } from "react";
import toast from 'react-hot-toast';
import ReactDOM from "react-dom";
import { QuestNode } from "./QuestNode.js";
import { Button } from "../components/ui/Button.js";
import ResizableLayout from "../components/ui/ResizableLayout.js";
import { Input } from "../components/ui/Input.js";
import { Label } from "../components/ui/Label.js";
import { Card } from "../components/ui/Card.js";
import { AnimatedSprite, BeerAnimated } from "../utils/animation.js";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Home,
  Minimize2,
  Maximize2,
  ChevronRight,
} from "lucide-react";
import useQuestNodesLogic from "../hooks/useQuestNodesLogic";

// ...restante do código do QuestNodesView...
