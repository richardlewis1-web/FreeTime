"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { footballCategories } from "@/lib/categories";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { RarityLabel, TriviaDifficulty } from "@/lib/types";

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  difficulty_vibe: string;
  icon: string;
};

type QuestionSummary = {
  id: string;
  title: string;
  category_id: string;
  categories: { name: string } | { name: string }[] | null;
};

type ExistingAliasRow = {
  alias: string;
};

type ExistingAnswerRow = {
  id: string;
  label: string;
  rank: number | null;
  base_points: number | null;
  rarity_score: number | null;
  rarity_label: RarityLabel | null;
  aliases: ExistingAliasRow[] | null;
};

type ExistingQuestionRow = {
  id: string;
  category_id: string;
  title: string;
  hint: string | null;
  difficulty: TriviaDifficulty | null;
  max_guesses: number | null;
  answers: ExistingAnswerRow[] | null;
};

type AnswerDraft = {
  label: string;
  aliases: string;
  basePoints: number;
  rarityScore: number;
  rarityLabel: RarityLabel;
};

const rarityLabels: RarityLabel[] = ["Tap-in", "Solid", "Niche", "Streets Won't Forget", "Proper Ball Knowledge"];
const difficulties: TriviaDifficulty[] = ["easy", "medium", "hard"];

const blankAnswer: AnswerDraft = {
  label: "",
  aliases: "",
  basePoints: 100,
  rarityScore: 25,
  rarityLabel: "Solid"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getQuestionCategoryName(question: QuestionSummary) {
  if (Array.isArray(question.categories)) {
    return question.categories[0]?.name ?? "Uncategorised";
  }

  return question.categories?.name ?? "Uncategorised";
}

function emptyAnswers() {
  return [{ ...blankAnswer }, { ...blankAnswer }, { ...blankAnswer }];
}

export default function AdminQuestionsPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [questionList, setQuestionList] = useState<QuestionSummary[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState<TriviaDifficulty>("medium");
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [answers, setAnswers] = useState<AnswerDraft[]>(emptyAnswers());
  const [status, setStatus] = useState("Loading categories...");
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  const isEditing = Boolean(editingQuestionId);
  const readyToSave = useMemo(
    () => Boolean(isSupabaseConfigured && categoryId && title.trim() && answers.some((answer) => answer.label.trim())),
    [answers, categoryId, title]
  );

  const refreshQuestions = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { data, count, error } = await supabase
      .from("questions")
      .select("id,title,category_id,categories(name)", { count: "exact" })
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`Could not load existing questions: ${error.message}`);
      return;
    }

    setQuestionList((data ?? []) as QuestionSummary[]);
    setQuestionCount(count ?? data?.length ?? 0);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      if (!supabase) {
        setStatus("Supabase is not configured. Add the environment variables in Vercel and redeploy.");
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id,name,description,difficulty_vibe,icon")
        .order("sort_order", { ascending: true });

      if (error) {
        setStatus(`Could not load categories: ${error.message}. Check the SQL has been run in Supabase.`);
        return;
      }

      const rows = data ?? [];
      setCategories(rows);
      setCategoryId(rows[0]?.id ?? "");
      setStatus(rows.length ? "Ready to add or edit a question." : "No categories found. Run the Supabase SQL first.");
      await refreshQuestions();
    }

    loadCategories();
  }, [refreshQuestions]);

  function resetForm(nextCategoryId = categories[0]?.id ?? "") {
    setEditingQuestionId("");
    setCategoryId(nextCategoryId);
    setTitle("");
    setHint("");
    setDifficulty("medium");
    setMaxGuesses(5);
    setAnswers(emptyAnswers());
    setStatus("Ready to add a new question.");
  }

  async function seedCategories() {
    if (!supabase) {
      setStatus("Supabase is not configured. Add the environment variables in Vercel and redeploy.");
      return;
    }

    setIsSaving(true);
    setStatus("Adding football culture categories...");

    const rows = footballCategories.map((category, index) => ({
      slug: slugify(category.name),
      name: category.name,
      description: category.description,
      difficulty_vibe: category.difficultyVibe,
      icon: category.icon,
      sort_order: (index + 1) * 10
    }));

    const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });

    if (error) {
      setStatus(`Could not add categories: ${error.message}`);
      setIsSaving(false);
      return;
    }

    const { data } = await supabase
      .from("categories")
      .select("id,name,description,difficulty_vibe,icon")
      .order("sort_order", { ascending: true });

    setCategories(data ?? []);
    setCategoryId(data?.[0]?.id ?? "");
    setStatus("Categories added. You can add a question now.");
    setIsSaving(false);
  }

  async function loadQuestionForEdit(questionId: string) {
    if (!supabase || !questionId) {
      resetForm();
      return;
    }

    setIsLoadingQuestion(true);
    setStatus("Loading question for editing...");

    const { data, error } = await supabase
      .from("questions")
      .select("id,category_id,title,hint,difficulty,max_guesses,answers(id,label,rank,base_points,rarity_score,rarity_label,aliases(alias))")
      .eq("id", questionId)
      .single();

    if (error || !data) {
      setStatus(`Could not load question: ${error?.message ?? "No question returned."}`);
      setIsLoadingQuestion(false);
      return;
    }

    const question = data as ExistingQuestionRow;
    const nextAnswers = (question.answers ?? [])
      .slice()
      .sort((first, second) => (first.rank ?? 0) - (second.rank ?? 0))
      .map((answer) => ({
        label: answer.label,
        aliases: (answer.aliases ?? [])
          .map((alias) => alias.alias)
          .filter((alias) => alias && alias !== answer.label)
          .join(", "),
        basePoints: answer.base_points ?? 100,
        rarityScore: answer.rarity_score ?? 25,
        rarityLabel: answer.rarity_label ?? "Solid"
      }));

    setEditingQuestionId(question.id);
    setCategoryId(question.category_id);
    setTitle(question.title);
    setHint(question.hint ?? "");
    setDifficulty(question.difficulty ?? "medium");
    setMaxGuesses(question.max_guesses ?? 5);
    setAnswers(nextAnswers.length ? nextAnswers : [{ ...blankAnswer }]);
    setStatus("Editing existing question. Save changes when ready.");
    setIsLoadingQuestion(false);
  }

  function updateAnswer(index: number, nextAnswer: Partial<AnswerDraft>) {
    setAnswers((current) => current.map((answer, answerIndex) => (answerIndex === index ? { ...answer, ...nextAnswer } : answer)));
  }

  function addAnswerRow() {
    setAnswers((current) => [...current, { ...blankAnswer }]);
  }

  function removeAnswerRow(index: number) {
    setAnswers((current) => current.filter((_, answerIndex) => answerIndex !== index));
  }

  async function saveAnswers(questionId: string, cleanAnswers: AnswerDraft[]) {
    if (!supabase) {
      return "Supabase is not configured.";
    }

    const { data: savedAnswers, error: answersError } = await supabase
      .from("answers")
      .insert(
        cleanAnswers.map((answer, index) => ({
          question_id: questionId,
          label: answer.label,
          rank: index + 1,
          base_points: answer.basePoints,
          rarity_score: answer.rarityScore,
          rarity_label: answer.rarityLabel
        }))
      )
      .select("id,label");

    if (answersError || !savedAnswers) {
      return answersError?.message ?? "No answers were returned.";
    }

    const aliasRows = savedAnswers.flatMap((savedAnswer, index) => {
      const answer = cleanAnswers[index];
      const aliases = [answer.label, ...answer.aliases.split(",")]
        .map((alias) => alias.trim())
        .filter(Boolean);
      return Array.from(new Set(aliases)).map((alias) => ({ answer_id: savedAnswer.id, alias }));
    });

    if (aliasRows.length) {
      const { error: aliasesError } = await supabase.from("aliases").insert(aliasRows);
      if (aliasesError) {
        return aliasesError.message;
      }
    }

    return "";
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !readyToSave) {
      setStatus("Add a title, category and at least one answer first.");
      return;
    }

    setIsSaving(true);
    setStatus(isEditing ? "Updating question..." : "Saving question...");

    const cleanAnswers = answers.map((answer) => ({ ...answer, label: answer.label.trim() })).filter((answer) => answer.label);
    let questionId = editingQuestionId;

    if (isEditing) {
      const { error: questionError } = await supabase
        .from("questions")
        .update({
          category_id: categoryId,
          title: title.trim(),
          hint: hint.trim(),
          difficulty,
          max_guesses: maxGuesses,
          active: true
        })
        .eq("id", editingQuestionId);

      if (questionError) {
        setStatus(`Could not update question: ${questionError.message}`);
        setIsSaving(false);
        return;
      }

      const { error: deleteError } = await supabase.from("answers").delete().eq("question_id", editingQuestionId);

      if (deleteError) {
        setStatus(`Question updated, but old answers could not be replaced: ${deleteError.message}`);
        setIsSaving(false);
        return;
      }
    } else {
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          category_id: categoryId,
          title: title.trim(),
          hint: hint.trim(),
          difficulty,
          max_guesses: maxGuesses,
          active: true
        })
        .select("id")
        .single();

      if (questionError || !question) {
        setStatus(`Could not save question: ${questionError?.message ?? "No question was returned."}`);
        setIsSaving(false);
        return;
      }

      questionId = question.id;
    }

    const answerError = await saveAnswers(questionId, cleanAnswers);

    if (answerError) {
      setStatus(`Question saved, but answers failed: ${answerError}`);
      setIsSaving(false);
      return;
    }

    await refreshQuestions();
    resetForm(categoryId);
    setStatus(isEditing ? "Question updated. Refresh the homepage to see it." : "Question saved. It should now appear in the game.");
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-6 text-brand-cream">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="rounded-lg border border-brand-cream/10 bg-brand-panel/85 p-4 shadow-brand">
          <Logo variant="compact" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-brand-lime/80">Admin</p>
          <h1 className="mt-2 text-2xl font-black">Manage questions</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-brand-cream/70">
            Add new lists or edit existing Supabase questions and aliases. No login yet, so keep this URL private for now.
          </p>
        </header>

        <section className="rounded-lg border border-brand-lime/20 bg-brand-panel/85 p-4">
          <p className="text-sm font-bold text-brand-cream/80">{status}</p>
          {questionCount !== null ? (
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-brand-lime/75">
              {questionCount} questions in Supabase
            </p>
          ) : null}
          {!categories.length ? (
            <button
              type="button"
              onClick={seedCategories}
              disabled={isSaving || !isSupabaseConfigured}
              className="mt-4 w-full rounded-lg bg-brand-lime px-4 py-3 text-sm font-black uppercase text-brand-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add default categories
            </button>
          ) : null}
        </section>

        <section className="rounded-lg border border-brand-cream/10 bg-brand-panel/85 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-brand-lime/80">Existing questions</h2>
            <button type="button" onClick={() => resetForm()} className="rounded-md border border-brand-lime/30 px-3 py-2 text-xs font-black uppercase text-brand-lime">
              New
            </button>
          </div>

          <label className="mt-4 block text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
            Choose question to edit
            <select
              value={editingQuestionId}
              onChange={(event) => loadQuestionForEdit(event.target.value)}
              disabled={isLoadingQuestion || !questionList.length}
              className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream disabled:opacity-50"
            >
              <option value="">Add a new question</option>
              {questionList.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.title} - {getQuestionCategoryName(question)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <form onSubmit={saveQuestion} className="flex flex-col gap-4 rounded-lg border border-brand-cream/10 bg-brand-panel/85 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-brand-lime/80">{isEditing ? "Edit question" : "Add question"}</h2>
            {isEditing ? <span className="rounded-md bg-brand-gold px-2 py-1 text-xs font-black uppercase text-brand-bg">Editing</span> : null}
          </div>

          <label className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
            Category
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
            Question title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream" placeholder="Name every Premier League Golden Boot winner" />
          </label>

          <label className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
            Hint
            <input value={hint} onChange={(event) => setHint(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream" placeholder="Use surnames or full names" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
              Difficulty
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as TriviaDifficulty)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream">
                {difficulties.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
              Max guesses
              <input type="number" min={1} max={50} value={maxGuesses} onChange={(event) => setMaxGuesses(Number(event.target.value))} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-3 py-3 text-base font-bold text-brand-cream" />
            </label>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-brand-lime/80">Answers</h2>
              <button type="button" onClick={addAnswerRow} className="rounded-md border border-brand-lime/30 px-3 py-2 text-xs font-black uppercase text-brand-lime">
                Add answer
              </button>
            </div>

            {answers.map((answer, index) => (
              <div key={index} className="rounded-lg border border-brand-cream/10 bg-brand-bg/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-cream/50">Answer {index + 1}</p>
                  {answers.length > 1 ? (
                    <button type="button" onClick={() => removeAnswerRow(index)} className="text-xs font-black uppercase text-coral">
                      Remove
                    </button>
                  ) : null}
                </div>

                <input value={answer.label} onChange={(event) => updateAnswer(index, { label: event.target.value })} className="mt-3 w-full rounded-md border border-brand-cream/10 bg-brand-panel px-3 py-3 text-base font-bold text-brand-cream" placeholder="Answer" />
                <input value={answer.aliases} onChange={(event) => updateAnswer(index, { aliases: event.target.value })} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-panel px-3 py-3 text-sm font-bold text-brand-cream" placeholder="Aliases, separated by commas" />

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <input type="number" min={0} value={answer.basePoints} onChange={(event) => updateAnswer(index, { basePoints: Number(event.target.value) })} className="rounded-md border border-brand-cream/10 bg-brand-panel px-2 py-3 text-sm font-bold text-brand-cream" aria-label="Base points" />
                  <input type="number" min={0} value={answer.rarityScore} onChange={(event) => updateAnswer(index, { rarityScore: Number(event.target.value) })} className="rounded-md border border-brand-cream/10 bg-brand-panel px-2 py-3 text-sm font-bold text-brand-cream" aria-label="Rarity score" />
                  <select value={answer.rarityLabel} onChange={(event) => updateAnswer(index, { rarityLabel: event.target.value as RarityLabel })} className="rounded-md border border-brand-cream/10 bg-brand-panel px-2 py-3 text-xs font-bold text-brand-cream" aria-label="Rarity label">
                    {rarityLabels.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </section>

          <button type="submit" disabled={!readyToSave || isSaving || isLoadingQuestion} className="rounded-lg bg-brand-lime px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-brand disabled:cursor-not-allowed disabled:opacity-50">
            {isEditing ? "Save changes" : "Save question"}
          </button>
        </form>
      </div>
    </main>
  );
}
