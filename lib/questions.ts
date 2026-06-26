import { unstable_noStore as noStore } from "next/cache";
import { localQuestions } from "./local-questions";
import { supabase } from "./supabase";
import type { RarityLabel, TriviaDifficulty, TriviaQuestion } from "./types";

type AliasRow = {
  alias: string;
};

type AnswerRow = {
  id: string;
  label: string;
  rank: number | null;
  base_points: number | null;
  rarity_score: number | null;
  rarity_label: RarityLabel | null;
  aliases: AliasRow[] | null;
};

type QuestionRow = {
  id: string;
  title: string;
  hint: string | null;
  difficulty: TriviaDifficulty | null;
  max_guesses: number | null;
  created_at: string | null;
  categories: { name: string } | { name: string }[] | null;
  answers: AnswerRow[] | null;
};

const rarityScores: Record<RarityLabel, number> = {
  "Tap-in": 10,
  Solid: 25,
  Niche: 45,
  "Streets Won't Forget": 70,
  "Proper Ball Knowledge": 100
};

function getCategoryName(category: QuestionRow["categories"]) {
  if (Array.isArray(category)) {
    return category[0]?.name ?? "Proper Ball Knowledge";
  }

  return category?.name ?? "Proper Ball Knowledge";
}

function mapQuestion(row: QuestionRow): TriviaQuestion {
  const answers = (row.answers ?? [])
    .slice()
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((answer, index) => {
      const aliasList = (answer.aliases ?? []).map((item) => item.alias).filter(Boolean);
      const rarityLabel = answer.rarity_label ?? "Solid";

      return {
        id: answer.id,
        label: answer.label,
        aliases: Array.from(new Set([answer.label, ...aliasList])),
        rank: answer.rank ?? index + 1,
        basePoints: answer.base_points ?? 100,
        rarityScore: rarityScores[rarityLabel] ?? answer.rarity_score ?? 25,
        rarityLabel
      };
    });

  return {
    id: row.id,
    title: row.title,
    hint: row.hint ?? "",
    category: getCategoryName(row.categories),
    difficulty: row.difficulty ?? "medium",
    maxGuesses: row.max_guesses ?? 5,
    createdAt: row.created_at ?? undefined,
    answers
  };
}

export async function getQuestions(): Promise<TriviaQuestion[]> {
  noStore();
  if (!supabase) {
    return localQuestions;
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id,title,hint,difficulty,max_guesses,created_at,categories(name),answers(id,label,rank,base_points,rarity_score,rarity_label,aliases(alias))")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return localQuestions;
  }

  const questions = (data as QuestionRow[]).map(mapQuestion).filter((question) => question.answers.length > 0);

  return questions.length > 0 ? questions : localQuestions;
}
