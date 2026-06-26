import { localQuestions } from "./local-questions";
import { supabase } from "./supabase";
import type { TriviaAnswer, TriviaDifficulty, TriviaQuestion } from "./types";

type QuestionRow = {
  id: string;
  title: string;
  hint: string | null;
  category: string;
  difficulty: TriviaDifficulty | null;
  max_guesses: number;
  answers: TriviaAnswer[];
};

export async function getQuestions(): Promise<TriviaQuestion[]> {
  if (!supabase) {
    return localQuestions;
  }

  const { data, error } = await supabase.from("questions").select("*").order("category", { ascending: true });

  if (error || !data?.length) {
    return localQuestions;
  }

  return (data as QuestionRow[]).map((question) => ({
    id: question.id,
    title: question.title,
    hint: question.hint ?? "",
    category: question.category,
    difficulty: question.difficulty ?? "medium",
    maxGuesses: question.max_guesses,
    answers: question.answers
  }));
}
