import type { ComponentType } from "react";
import CountryGuesser from "./country-guesser/CountryGuesser";

export type GameStatus = "available" | "coming-soon";

export interface GameEntry {
  slug: string;
  name: string;
  description: string;
  icon: string;
  status: GameStatus;
  component?: ComponentType;
}

export const games: GameEntry[] = [
  {
    slug: "country-guesser",
    name: "Country Guesser",
    description: "Identify highlighted countries on a world map",
    icon: "🌍",
    status: "available",
    component: CountryGuesser,
  },
  {
    slug: "capital-quiz",
    name: "Capital Quiz",
    description: "Match countries to their capital cities",
    icon: "🏛️",
    status: "coming-soon",
  },
  {
    slug: "flag-master",
    name: "Flag Master",
    description: "Recognize flags from around the world",
    icon: "🚩",
    status: "coming-soon",
  },
  {
    slug: "border-battle",
    name: "Border Battle",
    description: "Name all the countries that share a border",
    icon: "🗺️",
    status: "coming-soon",
  },
];

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
