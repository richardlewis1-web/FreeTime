"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { MultiplayerGame } from "@/components/multiplayer-game";
import { getCategoryMeta } from "@/lib/categories";
import type { GameResult, RarityLabel, TriviaAnswer, TriviaDifficulty, TriviaQuestion } from "@/lib/types";

type GuessResult = "correct" | "duplicate" | "wrong" | "empty";
type GameStatus = "playing" | "won" | "lost-guesses" | "lost-time" | "revealed";
type ViewMode = "play" | "create" | "rooms";
type DraftAnswer = { label: string; aliases: string };
type LeaderboardEntry = {
  id: string;
  playerName: string;
  score: number;
  foundCount: number;
  totalAnswers: number;
  accuracy: number;
  guessesUsed: number;
  questionTitle: string;
  category: string;
  createdAt: string;
};

const CUSTOM_QUESTIONS_KEY = "free-time-custom-questions";
const PLAYER_NAME_KEY = "free-time-player-name";
const LEADERBOARD_KEY = "free-time-leaderboard";
const rarityScores: Record<RarityLabel, number> = {
  "Tap-in": 10,
  Solid: 25,
  Niche: 45,
  "Streets Won't Forget": 70,
  "Proper Ball Knowledge": 100
};

const defaultRarity: { basePoints: number; rarityScore: number; rarityLabel: RarityLabel } = {
  basePoints: 100,
  rarityScore: rarityScores.Solid,
  rarityLabel: "Solid"
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalize(value).replace(/ /g, "-") || "answer";
}

const difficultyTimer: Record<TriviaDifficulty, { baseSeconds: number; secondsPerAnswer: number }> = {
  easy: { baseSeconds: 30, secondsPerAnswer: 5 },
  medium: { baseSeconds: 45, secondsPerAnswer: 6 },
  hard: { baseSeconds: 60, secondsPerAnswer: 7 }
};

function getQuestionTimeLimit(question: TriviaQuestion) {
  const timing = difficultyTimer[question.difficulty];

  return timing.baseSeconds + question.answers.length * timing.secondsPerAnswer;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes + ":" + remainingSeconds.toString().padStart(2, "0");
}

function getAnswerPoints(answer: TriviaAnswer) {
  const basePoints = Number.isFinite(answer.basePoints) ? answer.basePoints : defaultRarity.basePoints;
  const rarityScore = rarityScores[answer.rarityLabel] ?? defaultRarity.rarityScore;

  return Math.max(0, basePoints + rarityScore);
}

function buildAnswer(label: string, aliases: string, index: number): TriviaAnswer {
  const cleanLabel = label.trim();
  const aliasList = aliases
    .split(",")
    .map((alias) => alias.trim())
    .filter(Boolean);
  const uniqueAliases = Array.from(new Set([cleanLabel, ...aliasList]));

  return {
    id: slugify(cleanLabel) + "-" + index,
    label: cleanLabel,
    aliases: uniqueAliases,
    rank: index,
    ...defaultRarity
  };
}


function ensureQuestionScoring(question: TriviaQuestion): TriviaQuestion {
  return {
    ...question,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      aliases: answer.aliases?.length ? answer.aliases : [answer.label],
      rank: answer.rank ?? index + 1,
      basePoints: answer.basePoints ?? defaultRarity.basePoints,
      rarityLabel: answer.rarityLabel ?? defaultRarity.rarityLabel,
      rarityScore: rarityScores[answer.rarityLabel ?? defaultRarity.rarityLabel] ?? defaultRarity.rarityScore
    }))
  };
}

function buildResult(question: TriviaQuestion, foundAnswerIds: string[], wrongGuesses: string[], finalScore: number): GameResult {
  const foundSet = new Set(foundAnswerIds);
  const foundAnswers = question.answers.filter((answer) => foundSet.has(answer.id));
  const missedAnswers = question.answers.filter((answer) => !foundSet.has(answer.id));
  const attempts = foundAnswers.length + wrongGuesses.length;
  const accuracy = attempts === 0 ? 0 : Math.round((foundAnswers.length / attempts) * 100);
  const rarestAnswerFound = foundAnswers.reduce<TriviaAnswer | null>((rarest, answer) => (!rarest || answer.rarityScore > rarest.rarityScore ? answer : rarest), null);
  const mostObviousMiss = missedAnswers.reduce<TriviaAnswer | null>((obvious, answer) => (!obvious || answer.rarityScore < obvious.rarityScore ? answer : obvious), null);
  const allTapIns = foundAnswers.length > 0 && foundAnswers.every((answer) => answer.rarityLabel === "Tap-in");
  const eliteFind = foundAnswers.some((answer) => answer.rarityLabel === "Proper Ball Knowledge" || answer.rarityLabel === "Streets Won't Forget");
  const summaryLine = eliteFind
    ? "Proper ball knowledge. The pub has gone quiet."
    : allTapIns
      ? "All tap-ins, but they still count."
      : missedAnswers.length === 0
        ? "Clean sweep. Cold finish."
        : accuracy >= 70
          ? "Decent ball knowledge."
          : "Respectable, but the group chat will not be kind.";
  const commentary = missedAnswers.length === 0
    ? "Cold finish. No notes from the lads."
    : mostObviousMiss?.rarityLabel === "Tap-in"
      ? "You bottled the obvious one. Proper six-yard miss."
      : wrongGuesses.length >= question.maxGuesses
        ? "You've had a mare. The quiz equivalent of shanking it into row Z."
        : eliteFind
          ? "That was a proper Barclays finish. Wild pull, questionable defending."
          : "You forgot a tap-in. That was very Spursy.";

  return {
    finalScore,
    foundCount: foundAnswers.length,
    totalAnswers: question.answers.length,
    accuracy,
    guessesUsed: attempts,
    foundAnswers,
    missedAnswers,
    rarestAnswerFound,
    mostObviousMiss,
    summaryLine,
    commentary
  };
}

function getDailyQuestionIndex(questions: TriviaQuestion[], now = new Date()) {
  if (questions.length === 0) {
    return 0;
  }

  const dateKey = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = Math.floor(dateKey / 86400000);

  return dayNumber % questions.length;
}

function sortLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || b.foundCount - a.foundCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function cleanPlayerName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 18);
}

export function TriviaGame({ questions }: { questions: TriviaQuestion[] }) {
  const [customQuestions, setCustomQuestions] = useState<TriviaQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const playableQuestions = useMemo(() => [...questions, ...customQuestions].map(ensureQuestionScoring), [questions, customQuestions]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(playableQuestions.map((question) => question.category))).sort()], [playableQuestions]);
  const categoryCards = useMemo(
    () =>
      categories.map((categoryName) =>
        categoryName === "All"
          ? { name: "All", description: "Everything in the bag, no hiding place.", difficultyVibe: "Mixed", icon: "XI" }
          : getCategoryMeta(categoryName)
      ),
    [categories]
  );
  const categoryQuestions = useMemo(
    () => (selectedCategory === "All" ? playableQuestions : playableQuestions.filter((question) => question.category === selectedCategory)),
    [playableQuestions, selectedCategory]
  );
  const dailyQuestion = playableQuestions[getDailyQuestionIndex(playableQuestions)] ?? playableQuestions[0];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("play");
  const [guess, setGuess] = useState("");
  const [foundAnswerIds, setFoundAnswerIds] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(questions[0] ? getQuestionTimeLimit(questions[0]) : 0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState("Kick off with your first guess.");
  const [guessFeedback, setGuessFeedback] = useState<"idle" | "wrong">("idle");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Streets Won't Forget");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState<TriviaDifficulty>("medium");
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [draftAnswers, setDraftAnswers] = useState<DraftAnswer[]>([{ label: "", aliases: "" }]);
  const [builderMessage, setBuilderMessage] = useState("Add at least one answer to save a question.");
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [savedResultKey, setSavedResultKey] = useState("");

  const question = categoryQuestions[questionIndex] ?? categoryQuestions[0] ?? playableQuestions[0];
  const foundSet = useMemo(() => new Set(foundAnswerIds), [foundAnswerIds]);
  const foundAnswers = question.answers.filter((answer) => foundSet.has(answer.id));
  const missedAnswers = question.answers.filter((answer) => !foundSet.has(answer.id));
  const guessesRemaining = question.maxGuesses - wrongGuesses.length;
  const liveScore = foundAnswers.reduce((total, answer) => total + getAnswerPoints(answer), 0);
  const progress = Math.round((foundAnswerIds.length / question.answers.length) * 100);
  const timeLimit = getQuestionTimeLimit(question);
  const isGameOver = status !== "playing";
  const result = isGameOver ? buildResult(question, foundAnswerIds, wrongGuesses, liveScore) : null;

  useEffect(() => {
    const savedName = window.localStorage.getItem(PLAYER_NAME_KEY);
    const savedScores = window.localStorage.getItem(LEADERBOARD_KEY);
    const savedQuestions = window.localStorage.getItem(CUSTOM_QUESTIONS_KEY);

    if (savedName) {
      setPlayerName(savedName);
    }

    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores) as LeaderboardEntry[];

        if (Array.isArray(parsedScores)) {
          setLeaderboard(sortLeaderboard(parsedScores).slice(0, 25));
        }
      } catch {
        window.localStorage.removeItem(LEADERBOARD_KEY);
      }
    }

    if (!savedQuestions) {
      return;
    }

    try {
      const parsedQuestions = JSON.parse(savedQuestions) as TriviaQuestion[];

      if (Array.isArray(parsedQuestions)) {
        setCustomQuestions(parsedQuestions);
      }
    } catch {
      window.localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
    }
  }, []);

  useEffect(() => {
    const cleanName = cleanPlayerName(playerName);

    if (cleanName) {
      window.localStorage.setItem(PLAYER_NAME_KEY, cleanName);
      return;
    }

    window.localStorage.removeItem(PLAYER_NAME_KEY);
  }, [playerName]);

  useEffect(() => {
    if (!result) {
      return;
    }

    const cleanName = cleanPlayerName(playerName);

    if (!cleanName) {
      return;
    }

    const resultKey = [question.id, status, result.finalScore, result.foundCount, result.guessesUsed].join(":");

    if (savedResultKey === resultKey) {
      return;
    }

    const entry: LeaderboardEntry = {
      id: resultKey + ":" + Date.now(),
      playerName: cleanName,
      score: result.finalScore,
      foundCount: result.foundCount,
      totalAnswers: result.totalAnswers,
      accuracy: result.accuracy,
      guessesUsed: result.guessesUsed,
      questionTitle: question.title,
      category: question.category,
      createdAt: new Date().toISOString()
    };

    setLeaderboard((current) => {
      const nextLeaderboard = sortLeaderboard([entry, ...current]).slice(0, 25);
      window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(nextLeaderboard));

      return nextLeaderboard;
    });
    setSavedResultKey(resultKey);
  }, [playerName, question.category, question.id, question.title, result, savedResultKey, status]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All");
      setQuestionIndex(0);
      return;
    }

    if (questionIndex < categoryQuestions.length) {
      return;
    }

    setQuestionIndex(0);
  }, [categories, categoryQuestions.length, questionIndex, selectedCategory]);

  useEffect(() => {
    if (viewMode !== "play" || status !== "playing") {
      return;
    }

    if (timeLeft <= 0) {
      setStatus("lost-time");
      setMessage("Time is up.");
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((currentTime) => Math.max(0, currentTime - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [status, timeLeft, viewMode]);

  useEffect(() => {
    if (status === "playing" && foundAnswerIds.length === question.answers.length) {
      setStatus("won");
      setMessage("Clean sweep. Cold finish.");
    }
  }, [foundAnswerIds.length, question.answers.length, status]);

  useEffect(() => {
    if (guessesRemaining <= 0 && status === "playing") {
      setStatus("lost-guesses");
      setMessage("Out of guesses. You've had a mare.");
    }
  }, [guessesRemaining, status]);

  function checkGuess(rawGuess: string): GuessResult {
    const cleanedGuess = normalize(rawGuess);

    if (!cleanedGuess) {
      return "empty";
    }

    const matchedAnswer = question.answers.find((answer) => answer.aliases.some((alias) => normalize(alias) === cleanedGuess));

    if (!matchedAnswer) {
      setWrongGuesses((current) => [...current, rawGuess.trim()]);
      return "wrong";
    }

    if (foundSet.has(matchedAnswer.id)) {
      return "duplicate";
    }

    setFoundAnswerIds((current) => [...current, matchedAnswer.id]);
    return "correct";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGameOver) {
      return;
    }

    const result = checkGuess(guess);

    if (result === "correct") {
      const matchedAnswer = question.answers.find((answer) => answer.aliases.some((alias) => normalize(alias) === normalize(guess)));
      const pointsWon = matchedAnswer ? getAnswerPoints(matchedAnswer) : 0;
      setMessage(matchedAnswer?.rarityScore && matchedAnswer.rarityScore >= 70 ? `Proper ball knowledge. +${pointsWon} pts.` : `Correct. +${pointsWon} pts on the board.`);
      setGuess("");
      return;
    }

    if (result === "duplicate") {
      setMessage("Already found. Try another answer.");
      setGuess("");
      return;
    }

    if (result === "wrong") {
      setMessage("Wrong. One guess gone.");
      setGuessFeedback("wrong");
      window.setTimeout(() => setGuessFeedback("idle"), 280);
      setGuess("");
      return;
    }

    setMessage("Type an answer first.");
  }

  function startQuestion(nextIndex: number) {
    const nextQuestion = categoryQuestions[nextIndex];
    setQuestionIndex(nextIndex);
    setGuess("");
    setFoundAnswerIds([]);
    setWrongGuesses([]);
    setTimeLeft(getQuestionTimeLimit(nextQuestion));
    setStatus("playing");
    setSavedResultKey("");
    setMessage("New question. Start naming.");
    setViewMode("play");
  }

  function startSpecificQuestion(targetQuestion: TriviaQuestion, nextMessage = "Question loaded. Start naming.") {
    const nextCategory = targetQuestion.category;
    const nextCategoryQuestions = nextCategory === "All" ? playableQuestions : playableQuestions.filter((candidate) => candidate.category === nextCategory);
    const nextIndex = Math.max(0, nextCategoryQuestions.findIndex((candidate) => candidate.id === targetQuestion.id));

    setSelectedCategory(nextCategory);
    setQuestionIndex(nextIndex);
    setGuess("");
    setFoundAnswerIds([]);
    setWrongGuesses([]);
    setTimeLeft(getQuestionTimeLimit(targetQuestion));
    setStatus("playing");
    setSavedResultKey("");
    setMessage(nextMessage);
    setViewMode("play");
  }

  function moveQuestion(direction: 1 | -1) {
    startQuestion((questionIndex + direction + categoryQuestions.length) % categoryQuestions.length);
  }

  function resetQuestion() {
    startQuestion(questionIndex);
    setMessage("Clean slate. Have another go.");
  }

  function revealAnswers() {
    setStatus("revealed");
    setMessage("Full-time whistle. Let's see the damage.");
  }

  function selectCategory(categoryOption: string) {
    const nextQuestion = categoryOption === "All" ? playableQuestions[0] : playableQuestions.find((candidate) => candidate.category === categoryOption);

    setSelectedCategory(categoryOption);
    setQuestionIndex(0);
    setGuess("");
    setFoundAnswerIds([]);
    setWrongGuesses([]);

    if (nextQuestion) {
      setTimeLeft(getQuestionTimeLimit(nextQuestion));
    }

    setStatus("playing");
    setMessage("Category selected. Start naming.");
  }

  function updateDraftAnswer(index: number, field: keyof DraftAnswer, value: string) {
    setDraftAnswers((current) => current.map((answer, answerIndex) => (answerIndex === index ? { ...answer, [field]: value } : answer)));
  }

  function addDraftAnswer() {
    setDraftAnswers((current) => [...current, { label: "", aliases: "" }]);
  }

  function removeDraftAnswer(index: number) {
    setDraftAnswers((current) => (current.length === 1 ? current : current.filter((_, answerIndex) => answerIndex !== index)));
  }

  function resetBuilder() {
    setTitle("");
    setCategory("Streets Won't Forget");
    setHint("");
    setDifficulty("medium");
    setMaxGuesses(5);
    setDraftAnswers([{ label: "", aliases: "" }]);
  }

  function saveCustomQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanCategory = category.trim() || "Streets Won't Forget";
    const answers = draftAnswers
      .filter((answer) => answer.label.trim())
      .map((answer, index) => buildAnswer(answer.label, answer.aliases, index + 1));

    if (!cleanTitle) {
      setBuilderMessage("Give the question a title before saving.");
      return;
    }

    if (answers.length === 0) {
      setBuilderMessage("Add at least one answer before saving.");
      return;
    }

    const customQuestion: TriviaQuestion = {
      id: "custom-" + Date.now(),
      title: cleanTitle,
      hint: hint.trim() || "Custom question",
      category: cleanCategory,
      difficulty,
      maxGuesses: Number.isFinite(maxGuesses) ? Math.max(1, Math.round(maxGuesses)) : 1,
      answers
    };
    const nextCustomQuestions = [...customQuestions, customQuestion];

    setCustomQuestions(nextCustomQuestions);
    window.localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(nextCustomQuestions));
    setSelectedCategory(cleanCategory);
    setQuestionIndex(nextCustomQuestions.filter((question) => question.category === cleanCategory).length + questions.filter((question) => question.category === cleanCategory).length - 1);
    setGuess("");
    setFoundAnswerIds([]);
    setWrongGuesses([]);
    setTimeLeft(getQuestionTimeLimit(customQuestion));
    setStatus("playing");
    setMessage("Custom question saved. Start naming.");
    setViewMode("play");
    resetBuilder();
    setBuilderMessage("Question saved. It is ready to play.");
  }

  function clearCustomQuestions() {
    setCustomQuestions([]);
    window.localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
    startQuestion(0);
    setBuilderMessage("Custom questions cleared from this browser.");
  }

  function clearLeaderboard() {
    setLeaderboard([]);
    setSavedResultKey("");
    window.localStorage.removeItem(LEADERBOARD_KEY);
  }

  if (viewMode === "rooms") {
    return <MultiplayerGame questions={categoryQuestions} selectedCategory={selectedCategory} onBack={() => setViewMode("play")} />;
  }

  if (viewMode === "create") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8 pt-5 text-brand-cream sm:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Logo variant="compact" />
          <button type="button" onClick={() => setViewMode("play")} className="rounded-lg bg-brand-lime px-4 py-3 text-sm font-black text-brand-bg shadow-brand transition active:scale-95">
            Play
          </button>
        </header>

        <form onSubmit={saveCustomQuestion} className="space-y-4">
          <section className="relative overflow-hidden rounded-lg border border-brand-lime/20 bg-brand-panel p-5 shadow-brand">
            <div className="absolute inset-y-0 left-1/2 w-px bg-brand-cream/10" />
            <h2 className="relative text-2xl font-black leading-tight">Add your own list question</h2>
            <p className="relative mt-3 text-sm font-semibold text-brand-cream/75">{builderMessage}</p>
          </section>

          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-line px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Name every..." />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
              Category
              <input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-line px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Streets Won't Forget" />
            </label>
            <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
              Max guesses
              <input type="number" min="1" value={maxGuesses} onChange={(event) => setMaxGuesses(Number(event.target.value))} className="mt-2 w-full rounded-md border-0 bg-line px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" />
            </label>
          </div>

          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/70">
            Hint
            <input value={hint} onChange={(event) => setHint(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-line px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Optional clue" />
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as TriviaDifficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={["rounded-lg px-3 py-4 text-sm font-black capitalize shadow-sm transition active:scale-95", difficulty === level ? "bg-boot text-ink" : "bg-brand-cream/10 text-brand-cream"].join(" ")}
              >
                {level}
              </button>
            ))}
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-brand-cream/65">Answers</h2>
              <button type="button" onClick={addDraftAnswer} className="rounded-lg bg-boot px-4 py-3 text-sm font-black text-ink shadow-sm transition active:scale-95">
                Add answer
              </button>
            </div>

            {draftAnswers.map((answer, index) => (
              <div key={index} className="rounded-lg bg-line p-3 text-ink shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wide text-ink/40">Answer {index + 1}</p>
                  <button type="button" onClick={() => removeDraftAnswer(index)} className="rounded-md bg-[#EAF8EE] px-3 py-2 text-xs font-black text-ink/70">
                    Remove
                  </button>
                </div>
                <input value={answer.label} onChange={(event) => updateDraftAnswer(index, "label", event.target.value)} className="mt-3 w-full rounded-md border-0 bg-[#F4F7F1] px-4 py-4 text-base font-bold text-ink" placeholder="Answer shown on the board" />
                <input value={answer.aliases} onChange={(event) => updateDraftAnswer(index, "aliases", event.target.value)} className="mt-2 w-full rounded-md border-0 bg-[#F4F7F1] px-4 py-4 text-base font-semibold text-ink" placeholder="Aliases separated by commas" />
              </div>
            ))}
          </section>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="submit" className="rounded-lg bg-coral px-4 py-4 text-sm font-black uppercase text-white shadow-sm transition active:scale-95">
              Save
            </button>
            <button type="button" onClick={clearCustomQuestions} disabled={customQuestions.length === 0} className="rounded-lg bg-brand-cream/10 px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
              Clear custom
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8 pt-5 text-brand-cream sm:px-6">
      <header className="mb-5 flex items-center justify-end gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setViewMode("rooms")} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-3 text-sm font-black text-brand-cream shadow-sm transition active:scale-95">
            Rooms
          </button>
          <button type="button" onClick={() => setViewMode("create")} className="rounded-lg bg-brand-lime px-4 py-3 text-sm font-black text-brand-bg shadow-brand transition active:scale-95">
            Add
          </button>
        </div>
      </header>

      <section className="relative mb-5 overflow-hidden rounded-lg border border-brand-cream/10 bg-brand-panel/80 p-4 shadow-sm">
        <div className="absolute inset-0 opacity-10 pitch-panel-lines" />
        <div className="relative">
          <Logo variant="mono" tagline="Guess the list before your mates do." />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-cream/50">Football culture - Smart trivia - Matchday energy</p>
        </div>
      </section>

      <section className="mb-4 rounded-lg border border-brand-cream/10 bg-brand-panel/80 p-4 shadow-sm">
        <label className="block text-xs font-black uppercase tracking-[0.16em] text-brand-cream/60">
          Player name
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Add your name"
            className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-cream px-4 py-3 text-base font-black normal-case tracking-normal text-ink placeholder:text-ink/45"
            maxLength={18}
          />
        </label>
        <p className="mt-2 text-xs font-semibold text-brand-cream/55">Scores save locally on this device when a round ends.</p>
      </section>

      {dailyQuestion ? (
        <section className="mb-4 overflow-hidden rounded-lg border border-brand-gold/35 bg-brand-panel shadow-sm">
          <div className="h-1 bg-brand-gold" />
          <div className="relative p-4">
            <div className="absolute inset-0 opacity-10 pitch-panel-lines" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gold/85">Question of the day</p>
                <h2 className="mt-2 text-xl font-black leading-tight text-brand-cream">{dailyQuestion.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-5 text-brand-cream/65">{dailyQuestion.hint}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-wide text-brand-cream/45">{dailyQuestion.category} - {dailyQuestion.answers.length} answers - {dailyQuestion.difficulty}</p>
              </div>
              <div className="shrink-0 rounded-lg border border-brand-cream/10 bg-brand-bg/55 px-3 py-2 text-center">
                <p className="text-lg font-black text-brand-gold">{formatTime(getQuestionTimeLimit(dailyQuestion))}</p>
                <p className="text-[0.65rem] font-black uppercase tracking-wide text-brand-cream/45">Timer</p>
              </div>
            </div>
            <button type="button" onClick={() => startSpecificQuestion(dailyQuestion, "Question of the day loaded. Start naming.")} className="relative mt-4 w-full rounded-lg bg-brand-gold px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-sm transition active:scale-95">
              Play today's question
            </button>
          </div>
        </section>
      ) : null}

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categoryCards.map((categoryOption) => {
          const isSelected = selectedCategory === categoryOption.name;

          return (
            <button
              key={categoryOption.name}
              type="button"
              onClick={() => selectCategory(categoryOption.name)}
              className={[
                "relative overflow-hidden rounded-lg border p-4 text-left shadow-sm transition active:scale-[0.99]",
                "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-brand-cream/10 after:absolute after:inset-x-0 after:top-0 after:h-1",
                isSelected ? "border-brand-lime bg-brand-lime text-brand-bg after:bg-brand-gold" : "border-brand-lime/15 bg-brand-panel text-brand-cream after:bg-brand-lime/80 hover:border-brand-lime/45"
              ].join(" ")}
            >
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black leading-tight">{categoryOption.name}</p>
                  <p className="mt-1 text-sm font-semibold opacity-75">{categoryOption.description}</p>
                </div>
                <span className={["rounded-md px-2 py-1 text-xs font-black", isSelected ? "bg-brand-bg/15 text-brand-bg" : "bg-brand-bg text-brand-lime"].join(" ")}>{categoryOption.icon}</span>
              </div>
              <p className="relative mt-3 text-xs font-black uppercase tracking-wide opacity-70">Vibe: {categoryOption.difficultyVibe}</p>
            </button>
          );
        })}
      </section>

      <section className="relative overflow-hidden rounded-lg border border-brand-lime/20 bg-brand-pitch p-5 text-brand-cream shadow-brand">
        <div className="absolute inset-0 opacity-15 pitch-panel-lines" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-cream/70">{selectedCategory} - Question {questionIndex + 1} of {categoryQuestions.length}</p>
            <h2 className="mt-3 text-2xl font-black leading-tight">{question.title}</h2>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 text-center">
            <div className="rounded-lg bg-brand-lime px-3 py-2 text-xl font-black text-brand-bg">{formatTime(timeLeft)}</div>
            <div className="rounded-lg border border-brand-gold/35 bg-brand-bg/55 px-3 py-2 text-sm font-black text-brand-gold">{liveScore} pts</div>
          </div>
        </div>

        <p className="relative mt-4 text-sm leading-6 text-brand-cream/80">{question.hint}</p>
        <p className="relative mt-2 text-xs font-bold uppercase tracking-wide text-brand-cream/60">{formatTime(timeLimit)} total - {question.answers.length} answers - {question.difficulty}</p>

        <div className="relative mt-6 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase tracking-wide text-brand-cream/80">
          <div className="rounded-lg border border-brand-cream/10 bg-brand-bg/45 px-2 py-3"><span className="block text-lg text-brand-cream">{foundAnswerIds.length}/{question.answers.length}</span>Found</div>
          <div className="rounded-lg border border-brand-cream/10 bg-brand-bg/45 px-2 py-3"><span className="block text-lg text-brand-cream">{guessesRemaining}</span>Guesses</div>
          <div className="rounded-lg border border-brand-cream/10 bg-brand-bg/45 px-2 py-3"><span className="block text-lg text-brand-gold">{liveScore}</span>Score</div>
        </div>

        <div className="relative mt-4 h-3 overflow-hidden rounded-lg bg-brand-bg/55">
          <div className="h-full rounded-lg bg-brand-lime transition-all duration-300" style={{ width: String(progress) + "%" }} />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="sticky top-0 z-10 -mx-4 mt-5 bg-transparent px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className={["flex gap-2 rounded-lg border bg-brand-cream p-2 shadow-brand", guessFeedback === "wrong" ? "wrong-shake border-coral" : "border-brand-lime/20"].join(" ")}>
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            disabled={isGameOver}
            placeholder={isGameOver ? "Full-time whistle" : "Type an answer"}
            className="min-w-0 flex-1 rounded-md border-0 bg-[#fffbe9] px-4 py-4 text-base font-semibold text-ink placeholder:text-ink/45 disabled:opacity-60"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isGameOver}
            className="min-w-20 rounded-md bg-brand-bg px-4 py-3 text-sm font-black uppercase text-brand-lime transition active:scale-95 disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            Guess
          </button>
        </div>
      </form>

      <p className="min-h-7 px-1 text-sm font-bold text-brand-gold" aria-live="polite">{message}</p>

      {result ? (
        <ResultsScreen result={result} playerName={cleanPlayerName(playerName)} leaderboard={leaderboard} onClearLeaderboard={clearLeaderboard} onReset={resetQuestion} onNext={() => moveQuestion(1)} />
      ) : (
        <AnswerGrid answers={question.answers} foundSet={foundSet} reveal={false} />
      )}

      <nav className="mt-auto grid grid-cols-4 gap-2 pt-8">
        <button type="button" onClick={() => moveQuestion(-1)} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-3 py-4 text-sm font-black text-brand-cream shadow-sm transition active:scale-95">
          Prev
        </button>
        <button type="button" onClick={resetQuestion} className="rounded-lg bg-brand-pitch px-3 py-4 text-sm font-black text-brand-cream shadow-sm transition active:scale-95">
          Reset
        </button>
        <button type="button" onClick={revealAnswers} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-3 py-4 text-sm font-black text-brand-cream shadow-sm transition active:scale-95">
          Results
        </button>
        <button type="button" onClick={() => moveQuestion(1)} className="rounded-lg bg-brand-lime px-3 py-4 text-sm font-black text-brand-bg shadow-brand transition active:scale-95">
          Next
        </button>
      </nav>
    </main>
  );
}

function AnswerGrid({ answers, foundSet, reveal }: { answers: TriviaAnswer[]; foundSet: Set<string>; reveal: boolean }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3">
      {answers.map((answer, index) => {
        const isFound = foundSet.has(answer.id);
        const showAnswer = isFound || reveal;
        const rareAccent = answer.rarityScore >= 70;

        return (
          <div
            key={answer.id}
            className={[
              "min-h-16 rounded-lg border px-4 py-3 transition",
              isFound ? ["answer-pop bg-brand-cream text-brand-bg shadow-sm", rareAccent ? "border-brand-gold" : "border-brand-lime"].join(" ") : reveal ? "border-coral/40 bg-coral/10 text-brand-cream/80" : "border-brand-cream/10 bg-brand-panel/80 text-brand-cream/35"
            ].join(" ")}
          >
            <p className={["text-xs font-black uppercase", isFound ? "text-brand-bg/45" : "text-brand-cream/35"].join(" ")}>#{index + 1} - {answer.rarityLabel}</p>
            <p className="mt-1 break-words text-sm font-black">{showAnswer ? answer.label : "Hidden"}</p>
            {showAnswer ? <p className="mt-1 text-xs font-bold opacity-70">{getAnswerPoints(answer)} pts</p> : null}
          </div>
        );
      })}
    </section>
  );
}

function ResultsScreen({ result, playerName, leaderboard, onClearLeaderboard, onReset, onNext }: { result: GameResult; playerName: string; leaderboard: LeaderboardEntry[]; onClearLeaderboard: () => void; onReset: () => void; onNext: () => void }) {
  return (
    <section className="mt-5 space-y-4">
      <section className="relative overflow-hidden rounded-lg border border-brand-lime/25 bg-brand-panel p-5 text-brand-cream shadow-brand">
        <div className="absolute inset-0 opacity-15 pitch-panel-lines" />
        <div className="relative flex items-center justify-between gap-3">
          <Logo variant="compact" />
          <p className="rounded-md border border-brand-gold/40 px-3 py-2 text-right text-xs font-black uppercase tracking-[0.14em] text-brand-gold">Match Report</p>
        </div>
        <p className="relative mt-5 text-xs font-black uppercase tracking-[0.2em] text-brand-lime/80">Free Time Match Report</p>
        <h2 className="relative mt-2 text-3xl font-black leading-tight">{result.summaryLine}</h2>
        <p className="relative mt-3 text-base font-bold text-brand-cream/75">{result.commentary}</p>
        <div className="relative mt-5 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <Stat label="Final score" value={String(result.finalScore)} />
          <Stat label="Found" value={result.foundCount + "/" + result.totalAnswers} />
          <Stat label="Accuracy" value={result.accuracy + "%"} />
          <Stat label="Guesses used" value={String(result.guessesUsed)} />
        </div>
      </section>

      <LeaderboardPanel playerName={playerName} entries={leaderboard} onClear={onClearLeaderboard} />

      <div className="grid gap-3 sm:grid-cols-2">
        <PubCard title="Rarest answer found" answer={result.rarestAnswerFound} empty="No rare pulls. All tap-ins, if that." tone="good" />
        <PubCard title="Painful obvious miss" answer={result.mostObviousMiss} empty="No obvious miss. The group chat is stunned." tone="bad" />
      </div>

      <section className="rounded-lg border border-brand-lime/15 bg-brand-panel/85 p-4">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime/80">Answers found</h3>
        <AnswerList answers={result.foundAnswers} empty="Nothing found. You've had a mare." />
      </section>

      <section className="rounded-lg border border-coral/35 bg-coral/10 p-4">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-coral/90">Answers missed</h3>
        <AnswerList answers={result.missedAnswers} empty="None missed. Cold finish." />
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onReset} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95">
          Run it back
        </button>
        <button type="button" onClick={onNext} className="rounded-lg bg-brand-lime px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-brand transition active:scale-95">
          Next list
        </button>
      </div>
    </section>
  );
}

function LeaderboardPanel({ playerName, entries, onClear }: { playerName: string; entries: LeaderboardEntry[]; onClear: () => void }) {
  return (
    <section className="rounded-lg border border-brand-gold/25 bg-brand-panel/85 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-gold/90">Leaderboard</h3>
          <p className="mt-1 text-xs font-bold text-brand-cream/55">{playerName ? "Saved under " + playerName : "Add a name before playing to save your score."}</p>
        </div>
        <button type="button" onClick={onClear} disabled={entries.length === 0} className="rounded-md border border-brand-cream/10 px-3 py-2 text-xs font-black uppercase text-brand-cream/70 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35">
          Clear
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 rounded-lg bg-brand-bg/45 px-3 py-4 text-sm font-bold text-brand-cream/65">No scores yet. Finish a round with a name on the board.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.slice(0, 8).map((entry, index) => (
            <li key={entry.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-brand-bg/45 px-3 py-3">
              <span className="text-sm font-black text-brand-gold">#{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-brand-cream">{entry.playerName}</p>
                <p className="truncate text-xs font-bold text-brand-cream/50">{entry.foundCount}/{entry.totalAnswers} - {entry.accuracy}% - {entry.category}</p>
              </div>
              <span className="text-base font-black text-brand-lime">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-cream/10 bg-brand-bg/55 px-3 py-4 text-brand-cream">
      <p className="text-xl font-black text-brand-lime">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-brand-cream/60">{label}</p>
    </div>
  );
}

function PubCard({ title, answer, empty, tone }: { title: string; answer: TriviaAnswer | null; empty: string; tone: "good" | "bad" }) {
  return (
    <section className={["rounded-lg border p-4", tone === "good" ? "border-brand-gold/45 bg-brand-gold/10" : "border-coral/40 bg-coral/10"].join(" ")}>
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-cream/65">{title}</h3>
      {answer ? (
        <div className="mt-3">
          <p className="text-xl font-black text-brand-cream">{answer.label}</p>
          <p className="mt-1 text-sm font-bold text-brand-cream/70">{answer.rarityLabel} - {getAnswerPoints(answer)} pts</p>
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold text-brand-cream/70">{empty}</p>
      )}
    </section>
  );
}

function AnswerList({ answers, empty }: { answers: TriviaAnswer[]; empty: string }) {
  if (answers.length === 0) {
    return <p className="mt-3 text-sm font-bold text-brand-cream/65">{empty}</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {answers.map((answer) => (
        <span key={answer.id} className="rounded-lg bg-line px-3 py-2 text-sm font-black text-ink">
          {answer.label} <span className="font-bold text-ink/45">{answer.rarityLabel}</span>
        </span>
      ))}
    </div>
  );
}
