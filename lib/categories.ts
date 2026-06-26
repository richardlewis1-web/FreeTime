import type { CategoryMeta } from "./types";

export const footballCategories: CategoryMeta[] = [
  {
    name: "Barclaysmen",
    description: "Cult heroes, limbs, Barclays-era chaos.",
    difficultyVibe: "Medium",
    icon: "B90"
  },
  {
    name: "England Pain",
    description: "Squads, shootouts and tournament trauma.",
    difficultyVibe: "Hard",
    icon: "ENG"
  },
  {
    name: "Transfer Chaos",
    description: "Fees, flops, deadline-day madness.",
    difficultyVibe: "Medium",
    icon: "FAX"
  },
  {
    name: "Champions League Heritage",
    description: "European nights, great teams and forgotten finalists.",
    difficultyVibe: "Hard",
    icon: "UCL"
  },
  {
    name: "Streets Won't Forget",
    description: "Names that make the group chat nod in silence.",
    difficultyVibe: "Niche",
    icon: "STW"
  },
  {
    name: "Proper Ball Knowledge",
    description: "Awards, eras and answers for the football sickos.",
    difficultyVibe: "Hard",
    icon: "PBK"
  },
  {
    name: "Deadline Day",
    description: "Car windows, purple ties and last-minute panic.",
    difficultyVibe: "Medium",
    icon: "DD"
  },
  {
    name: "World Cup Fever",
    description: "Nations, golden summers and penalty heartbreak.",
    difficultyVibe: "Medium",
    icon: "WC"
  },
  {
    name: "Premier League Royalty",
    description: "Champions, ever-presents and top-flight royalty.",
    difficultyVibe: "Medium",
    icon: "PL"
  },
  {
    name: "Manager Merry-Go-Round",
    description: "Touchline royalty, panic appointments and title bosses.",
    difficultyVibe: "Hard",
    icon: "MGR"
  }
];

export function getCategoryMeta(categoryName: string): CategoryMeta {
  return (
    footballCategories.find((category) => category.name === categoryName) ?? {
      name: categoryName,
      description: "A custom list from the football group chat.",
      difficultyVibe: "Custom",
      icon: "FT"
    }
  );
}
