export type TriviaDifficulty = "easy" | "medium" | "hard";
export type RarityLabel = "Tap-in" | "Solid" | "Niche" | "Streets Won't Forget" | "Proper Ball Knowledge";

export type TriviaQuestion = {
  id: string;
  title: string;
  hint: string;
  category: string;
  difficulty: TriviaDifficulty;
  maxGuesses: number;
  createdAt?: string;
  answers: TriviaAnswer[];
};

export type TriviaAnswer = {
  id: string;
  label: string;
  aliases: string[];
  rank: number;
  basePoints: number;
  rarityScore: number;
  rarityLabel: RarityLabel;
};

export type CategoryMeta = {
  name: string;
  description: string;
  difficultyVibe: string;
  icon: string;
};

export type GameResult = {
  finalScore: number;
  foundCount: number;
  totalAnswers: number;
  accuracy: number;
  guessesUsed: number;
  foundAnswers: TriviaAnswer[];
  missedAnswers: TriviaAnswer[];
  rarestAnswerFound: TriviaAnswer | null;
  mostObviousMiss: TriviaAnswer | null;
  summaryLine: string;
  commentary: string;
};
