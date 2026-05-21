import type { ComponentType } from "react";
import CountryGuesser from "./country-guesser/CountryGuesser";
import CapitalQuiz from "./capital-quiz/CapitalQuiz";
import FlagMaster from "./flag-master/FlagMaster";
import BorderBattle from "./border-battle/BorderBattle";
import TimelineRush from "./timeline-rush/TimelineRush";
import EmpireBuilder from "./empire-builder/EmpireBuilder";

export type GameStatus = "available" | "coming-soon";
export type GameCategory = "Geography" | "History" | "Flags & Capitals";

export interface GameEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string; // CSS color expression for hub card glow
  category: GameCategory;
  difficulty: "Easy" | "Medium" | "Hard";
  roundLength: string;
  status: GameStatus;
  component?: ComponentType;
}

export const games: GameEntry[] = [
  {
    slug: "country-guesser",
    name: "Country Guesser",
    tagline: "Spot it on the map",
    description: "Identify the country highlighted on a world map from four options.",
    icon: "🌍",
    accent: "var(--amber)",
    category: "Geography",
    difficulty: "Medium",
    roundLength: "20 countries",
    status: "available",
    component: CountryGuesser,
  },
  {
    slug: "capital-quiz",
    name: "Capital Quiz",
    tagline: "Match country to capital",
    description: "Pick the correct capital city for each country in the round.",
    icon: "🏛️",
    accent: "oklch(0.7 0.15 200)",
    category: "Flags & Capitals",
    difficulty: "Easy",
    roundLength: "20 questions",
    status: "available",
    component: CapitalQuiz,
  },
  {
    slug: "flag-master",
    name: "Flag Master",
    tagline: "Recognize the flag",
    description: "A flag appears — name the country it belongs to.",
    icon: "🚩",
    accent: "oklch(0.65 0.22 25)",
    category: "Flags & Capitals",
    difficulty: "Medium",
    roundLength: "20 flags",
    status: "available",
    component: FlagMaster,
  },
  {
    slug: "border-battle",
    name: "Border Battle",
    tagline: "Name every neighbor",
    description: "List every country that shares a land border with the prompt.",
    icon: "🗺️",
    accent: "oklch(0.7 0.18 145)",
    category: "Geography",
    difficulty: "Hard",
    roundLength: "5 rounds",
    status: "available",
    component: BorderBattle,
  },
  {
    slug: "timeline-rush",
    name: "Timeline Rush",
    tagline: "Which came first?",
    description: "Compare world history events and choose the one that happened earlier.",
    icon: "⏳",
    accent: "oklch(0.72 0.16 110)",
    category: "History",
    difficulty: "Medium",
    roundLength: "15 questions",
    status: "available",
    component: TimelineRush,
  },
  {
    slug: "empire-builder",
    name: "Empire Builder",
    tagline: "Map historic reach",
    description: "Select the modern countries touched by great empires and historical states.",
    icon: "🏛️",
    accent: "oklch(0.68 0.17 45)",
    category: "History",
    difficulty: "Hard",
    roundLength: "8 empires",
    status: "available",
    component: EmpireBuilder,
  },
];

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
