"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footballCategories } from "@/lib/categories";
import { localQuestions } from "@/lib/local-questions";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { RarityLabel, TriviaDifficulty } from "@/lib/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type DraftAnswer = {
  label: string;
  aliases: string;
  rarityLabel: RarityLabel;
};

const rarityLabels: RarityLabel[] = ["Tap-in", "Solid", "Niche", "Streets Won't Forget", "Proper Ball Knowledge"];
const rarityScores: Record<RarityLabel, number> = {
  "Tap-in": 10,
  Solid: 25,
  Niche: 45,
  "Streets Won't Forget": 70,
  "Proper Ball Knowledge": 100
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}

function starterAnswers(): DraftAnswer[] {
  return [
    { label: "", aliases: "", rarityLabel: "Tap-in" },
    { label: "", aliases: "", rarityLabel: "Solid" },
    { label: "", aliases: "", rarityLabel: "Niche" }
  ];
}

export default function AdminQuestionsPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [title, setTitle] = useState("");
  const [hint, setHint] = useState("");
  const [categoryName, setCategoryName] = useState("Barclaysmen");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [difficulty, setDifficulty] = useState<TriviaDifficulty>("medium");
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [answers, setAnswers] = useState<DraftAnswer[]>(starterAnswers());
  const [message, setMessage] = useState(isSupabaseConfigured ? "Add a question to Supabase." : "Supabase is not configured. Add your environment variables and restart the dev server.");
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const categoryOptions = useMemo(() => {
    const names = new Set([...footballCategories.map((category) => category.name), ...categories.map((category) => category.name)]);

    return Array.from(names).sort();
  }, [categories]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase
      .from("categories")
      .select("id,name,slug")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Could not load categories: ${error.message}. Check the SQL has been run in Supabase.`);
          return;
        }

        setCategories((data ?? []) as CategoryRow[]);
      });
  }, []);

  function updateAnswer(index: number, field: keyof DraftAnswer, value: string) {
    setAnswers((current) => current.map((answer, answerIndex) => (answerIndex === index ? { ...answer, [field]: value } : answer)));
  }

  function addAnswer() {
    setAnswers((current) => [...current, { label: "", aliases: "", rarityLabel: "Solid" }]);
  }

  function removeAnswer(index: number) {
    setAnswers((current) => (current.length === 1 ? current : current.filter((_, answerIndex) => answerIndex !== index)));
  }

  function resetForm() {
    setTitle("");
    setHint("");
    setNewCategoryName("");
    setDifficulty("medium");
    setMaxGuesses(5);
    setAnswers(starterAnswers());
  }

  async function getOrCreateCategory(name: string) {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const cleanName = name.trim();
    const existingCategory = categories.find((category) => category.name.toLowerCase() === cleanName.toLowerCase());

    if (existingCategory) {
      return existingCategory;
    }

    const meta = footballCategories.find((category) => category.name.toLowerCase() === cleanName.toLowerCase());
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          slug: slugify(cleanName),
          name: cleanName,
          description: meta?.description ?? "Custom Free Time category.",
          difficulty_vibe: meta?.difficultyVibe ?? "Mixed",
          icon: meta?.icon ?? "FT"
        },
        { onConflict: "slug" }
      )
      .select("id,name,slug")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not create category.");
    }

    const nextCategory = data as CategoryRow;
    setCategories((current) => [...current.filter((category) => category.id !== nextCategory.id), nextCategory]);

    return nextCategory;
  }

  async function insertQuestionWithAnswers(input: {
    title: string;
    hint: string;
    categoryName: string;
    difficulty: TriviaDifficulty;
    maxGuesses: number;
    answers: { label: string; aliases: string[]; rarityLabel: RarityLabel; basePoints?: number; rarityScore?: number }[];
  }) {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const category = await getOrCreateCategory(input.categoryName);
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .insert({
        category_id: category.id,
        title: input.title,
        hint: input.hint,
        difficulty: input.difficulty,
        max_guesses: Math.max(1, Math.round(input.maxGuesses)),
        active: true
      })
      .select("id")
      .single();

    if (questionError || !question) {
      throw new Error(questionError?.message ?? "Could not create question.");
    }

    for (let index = 0; index < input.answers.length; index += 1) {
      const answer = input.answers[index];
      const { data: insertedAnswer, error: answerError } = await supabase
        .from("answers")
        .insert({
          question_id: question.id,
          label: answer.label,
          rank: index + 1,
          base_points: answer.basePoints ?? 100,
          rarity_score: rarityScores[answer.rarityLabel] ?? answer.rarityScore ?? 25,
          rarity_label: answer.rarityLabel
        })
        .select("id")
        .single();

      if (answerError || !insertedAnswer) {
        throw new Error(answerError?.message ?? "Could not create answer.");
      }

      const aliasRows = Array.from(new Set([answer.label, ...answer.aliases].map((alias) => alias.trim()).filter(Boolean))).map((alias) => ({
        answer_id: insertedAnswer.id,
        alias
      }));

      if (aliasRows.length > 0) {
        const { error: aliasError } = await supabase.from("aliases").insert(aliasRows);

        if (aliasError) {
          throw new Error(aliasError.message);
        }
      }
    }

    return category;
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase is not configured. Add the env vars and restart the dev server.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanCategory = (newCategoryName || categoryName).trim();
    const cleanAnswers: DraftAnswer[] = answers
      .map((answer) => ({ ...answer, label: answer.label.trim(), aliases: answer.aliases.trim() }))
      .filter((answer) => Boolean(answer.label));

    if (!cleanTitle) {
      setMessage("Give the question a title.");
      return;
    }

    if (!cleanCategory) {
      setMessage("Choose or add a category.");
      return;
    }

    if (cleanAnswers.length === 0) {
      setMessage("Add at least one answer.");
      return;
    }

    setIsSaving(true);
    setMessage("Saving question...");

    try {
      const category = await insertQuestionWithAnswers({
        title: cleanTitle,
        hint: hint.trim(),
        categoryName: cleanCategory,
        difficulty,
        maxGuesses,
        answers: cleanAnswers.map((answer) => ({
          label: answer.label,
          aliases: answer.aliases.split(",").map((alias) => alias.trim()).filter(Boolean),
          rarityLabel: answer.rarityLabel
        }))
      });

      resetForm();
      setCategoryName(category.name);
      setMessage("Question saved. Refresh the home page to pull it into the game.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  async function importLocalQuestions() {
    if (!supabase) {
      setMessage("Supabase is not configured. Add the env vars and restart the dev server.");
      return;
    }

    setIsImporting(true);
    setMessage("Importing local questions into Supabase...");

    try {
      const { data: existingQuestions, error: existingError } = await supabase.from("questions").select("title");

      if (existingError) {
        throw new Error(existingError.message);
      }

      const existingTitles = new Set((existingQuestions ?? []).map((question) => String(question.title).toLowerCase()));
      let imported = 0;
      let skipped = 0;

      for (const question of localQuestions) {
        if (existingTitles.has(question.title.toLowerCase())) {
          skipped += 1;
          continue;
        }

        await insertQuestionWithAnswers({
          title: question.title,
          hint: question.hint,
          categoryName: question.category,
          difficulty: question.difficulty,
          maxGuesses: question.maxGuesses,
          answers: question.answers.map((answer) => ({
            label: answer.label,
            aliases: answer.aliases,
            rarityLabel: answer.rarityLabel,
            basePoints: answer.basePoints,
            rarityScore: answer.rarityScore
          }))
        });
        existingTitles.add(question.title.toLowerCase());
        imported += 1;
      }

      setMessage("Import complete. Added " + imported + " questions and skipped " + skipped + " already in Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import local questions.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-8 pt-5 text-brand-cream sm:px-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <Logo variant="compact" />
        <Link href="/" className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-3 text-sm font-black text-brand-cream shadow-sm transition active:scale-95">
          Play
        </Link>
      </header>

      <section className="mb-4 rounded-lg border border-brand-lime/20 bg-brand-panel p-5 shadow-brand">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime/80">Admin</p>
        <h1 className="mt-2 text-3xl font-black leading-tight">Add questions</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-brand-cream/70">No login yet. This writes directly to your Supabase tables using the anon key and the temporary public insert policies in the SQL file.</p>
        <p className="mt-3 rounded-lg bg-brand-bg/45 px-3 py-3 text-sm font-bold text-brand-gold">{message}</p>
      </section>
      <section className="mb-4 rounded-lg border border-brand-gold/25 bg-brand-panel/85 p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gold/90">Bulk import</p>
        <h2 className="mt-2 text-2xl font-black leading-tight">Import local questions</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-brand-cream/65">Uploads the current built-in question set to Supabase. Questions with the same title are skipped.</p>
        <button type="button" onClick={importLocalQuestions} disabled={isImporting || !isSupabaseConfigured} className="mt-4 w-full rounded-lg bg-brand-gold px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
          {isImporting ? "Importing..." : "Import " + localQuestions.length + " local questions"}
        </button>
      </section>

      <form onSubmit={saveQuestion} className="space-y-4">
        <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
          Question title
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Name every..." />
        </label>

        <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
          Hint
          <input value={hint} onChange={(event) => setHint(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Optional clue" />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            Category
            <select value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm">
              {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            New category
            <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Optional" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as TriviaDifficulty)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm">
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>
          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            Max guesses
            <input type="number" min="1" value={maxGuesses} onChange={(event) => setMaxGuesses(Number(event.target.value))} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" />
          </label>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-brand-cream/65">Answers</h2>
            <button type="button" onClick={addAnswer} className="rounded-lg bg-brand-gold px-4 py-3 text-sm font-black text-brand-bg shadow-sm transition active:scale-95">Add answer</button>
          </div>

          {answers.map((answer, index) => (
            <div key={index} className="rounded-lg border border-brand-cream/10 bg-brand-panel p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wide text-brand-cream/45">Answer {index + 1}</p>
                <button type="button" onClick={() => removeAnswer(index)} className="rounded-md border border-brand-cream/10 px-3 py-2 text-xs font-black text-brand-cream/70">Remove</button>
              </div>
              <input value={answer.label} onChange={(event) => updateAnswer(index, "label", event.target.value)} className="mt-3 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold text-ink" placeholder="Answer shown on the board" />
              <input value={answer.aliases} onChange={(event) => updateAnswer(index, "aliases", event.target.value)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-semibold text-ink" placeholder="Aliases separated by commas" />
              <select value={answer.rarityLabel} onChange={(event) => updateAnswer(index, "rarityLabel", event.target.value as RarityLabel)} className="mt-2 w-full rounded-md border-0 bg-brand-cream px-4 py-4 text-base font-bold text-ink">
                {rarityLabels.map((label) => <option key={label} value={label}>{label} (+{rarityScores[label]})</option>)}
              </select>
            </div>
          ))}
        </section>

        <button type="submit" disabled={isSaving || !isSupabaseConfigured} className="w-full rounded-lg bg-brand-lime px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-brand transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
          {isSaving ? "Saving..." : "Save question"}
        </button>
      </form>
    </main>
  );
}
