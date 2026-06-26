"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/logo";
import { supabase } from "@/lib/supabase";
import type { TriviaQuestion } from "@/lib/types";

type RoomStatus = "setup" | "lobby" | "playing" | "finished";
type PersistedRoomStatus = "lobby" | "playing" | "finished";
type RoomRow = {
  code: string;
  status: PersistedRoomStatus;
  question: TriviaQuestion | null;
  selected_question_id: string | null;
};
type PlayerPresence = {
  clientId: string;
  username: string;
  correctCount: number;
  guessesRemaining: number;
  status: "lobby" | "playing" | "finished";
};
type BroadcastPayload =
  | { type: "room-start"; question: TriviaQuestion; startedAt: number }
  | { type: "score-update"; player: PlayerPresence }
  | { type: "room-reset" };

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeRoomCode() {
  return Array.from({ length: 5 }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");
}

function makeClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "player-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function isMissingRoomsTableError(message: string) {
  return message.toLowerCase().includes("public.rooms") || message.toLowerCase().includes("schema cache") || message.toLowerCase().includes("could not find the table");
}

function flattenPresence(state: Record<string, PlayerPresence[]>) {
  return Object.values(state)
    .flat()
    .filter((player) => player.clientId && player.username)
    .sort((first, second) => second.correctCount - first.correctCount || second.guessesRemaining - first.guessesRemaining || first.username.localeCompare(second.username));
}

export function MultiplayerGame({ questions, selectedCategory, onBack }: { questions: TriviaQuestion[]; selectedCategory: string; onBack: () => void }) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("setup");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");
  const [clientId] = useState(makeClientId);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(questions[0]?.id ?? "");
  const [guess, setGuess] = useState("");
  const [foundAnswerIds, setFoundAnswerIds] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [message, setMessage] = useState("Create or join a room to start.");
  const roomLink = roomCode ? `${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?room=${roomCode}` : "";

  const foundSet = useMemo(() => new Set(foundAnswerIds), [foundAnswerIds]);
  const selectedRoomQuestion = useMemo(
    () => questions.find((roomQuestion) => roomQuestion.id === selectedQuestionId) ?? questions[0] ?? null,
    [questions, selectedQuestionId]
  );
  const guessesRemaining = question ? question.maxGuesses - wrongGuesses.length : 0;
  const isGameOver = roomStatus === "finished" || Boolean(question && (foundAnswerIds.length === question.answers.length || guessesRemaining <= 0));
  const selfPresence: PlayerPresence = useMemo(
    () => ({
      clientId,
      username: username.trim() || "Player",
      correctCount: foundAnswerIds.length,
      guessesRemaining: Math.max(0, guessesRemaining),
      status: roomStatus === "playing" ? "playing" : roomStatus === "finished" ? "finished" : "lobby"
    }),
    [clientId, foundAnswerIds.length, guessesRemaining, roomStatus, username]
  );

  useEffect(() => {
    const roomFromLink = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase().slice(0, 5);

    if (roomFromLink) {
      setJoinCode(roomFromLink);
      setMessage("Room link loaded. Add your name and join.");
    }
  }, []);

  useEffect(() => {
    if (!questions.some((roomQuestion) => roomQuestion.id === selectedQuestionId)) {
      setSelectedQuestionId(questions[0]?.id ?? "");
    }
  }, [questions, selectedQuestionId]);

  useEffect(() => {
    if (!isGameOver || roomStatus !== "playing") {
      return;
    }

    setRoomStatus("finished");
    setMessage(foundAnswerIds.length === question?.answers.length ? "You found every answer." : "No guesses left.");
  }, [foundAnswerIds.length, guessesRemaining, isGameOver, question?.answers.length, roomStatus]);

  useEffect(() => {
    if (!channelRef.current || roomStatus === "setup") {
      return;
    }

    channelRef.current.track(selfPresence);
    channelRef.current.send({ type: "broadcast", event: "room-event", payload: { type: "score-update", player: selfPresence } satisfies BroadcastPayload });
  }, [selfPresence, roomStatus]);

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
      }
    };
  }, []);

  async function loadPersistedRoom(code: string) {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.from("rooms").select("code,status,question,selected_question_id").eq("code", code).maybeSingle();

    if (error) {
      if (isMissingRoomsTableError(error.message)) {
        setMessage("Room storage is not ready yet. You can still join live rooms with the code.");
        return null;
      }

      setMessage("Could not load that room yet. Check the room code and try again.");
      return null;
    }

    return (data as RoomRow | null) ?? null;
  }

  async function savePersistedRoom(code: string, nextStatus: PersistedRoomStatus, nextQuestion: TriviaQuestion | null, nextSelectedQuestionId: string | null) {
    if (!supabase) {
      return false;
    }

    const { error } = await supabase.from("rooms").upsert(
      {
        code,
        status: nextStatus,
        question: nextQuestion,
        selected_question_id: nextSelectedQuestionId,
        updated_at: new Date().toISOString()
      },
      { onConflict: "code" }
    );

    if (error) {
      if (isMissingRoomsTableError(error.message)) {
        setMessage("Room created. Share the code. Persistent room storage still needs the Supabase SQL update.");
        return true;
      }

      setMessage(`Could not save room state: ${error.message}`);
      return false;
    }

    return true;
  }

  async function connectToRoom(nextRoomCode: string, nextUsername: string, host: boolean) {
    if (!supabase) {
      setMessage("Supabase is not configured yet. Add your env vars to use rooms.");
      return;
    }

    if (!nextUsername.trim()) {
      setMessage("Enter a username first.");
      return;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const cleanRoomCode = nextRoomCode.trim().toUpperCase();

    if (cleanRoomCode.length !== 5) {
      setMessage("Enter a 5-character room code.");
      return;
    }

    const persistedRoom = host ? null : await loadPersistedRoom(cleanRoomCode);

    const channel = supabase.channel("free-time-room-" + cleanRoomCode, {
      config: {
        broadcast: { self: true },
        presence: { key: clientId }
      }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setPlayers(flattenPresence(channel.presenceState() as Record<string, PlayerPresence[]>));
      })
      .on("broadcast", { event: "room-event" }, ({ payload }: { payload: BroadcastPayload }) => {
        if (payload.type === "room-start") {
          setQuestion(payload.question);
          setFoundAnswerIds([]);
          setWrongGuesses([]);
          setRoomStatus("playing");
          setMessage("Room started. Everyone has the same list.");
          return;
        }

        if (payload.type === "score-update") {
          setPlayers((currentPlayers) => {
            const otherPlayers = currentPlayers.filter((player) => player.clientId !== payload.player.clientId);
            return [...otherPlayers, payload.player].sort(
              (first, second) => second.correctCount - first.correctCount || second.guessesRemaining - first.guessesRemaining || first.username.localeCompare(second.username)
            );
          });
          return;
        }

        if (payload.type === "room-reset") {
          setQuestion(null);
          setFoundAnswerIds([]);
          setWrongGuesses([]);
          setRoomStatus("lobby");
          setMessage("Back in the lobby.");
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel;
          setRoomCode(cleanRoomCode);
          if (host) {
            window.history.replaceState(null, "", `?room=${cleanRoomCode}`);
          }
          if (host) {
            await savePersistedRoom(cleanRoomCode, "lobby", null, selectedRoomQuestion?.id ?? null);
          }

          setUsername(nextUsername.trim());
          setIsHost(host);

          if (!host && persistedRoom?.status === "playing" && persistedRoom.question) {
            setQuestion(persistedRoom.question);
            setSelectedQuestionId(persistedRoom.selected_question_id ?? persistedRoom.question.id);
            setFoundAnswerIds([]);
            setWrongGuesses([]);
            setRoomStatus("playing");
            setMessage("Joined the room. The list is already live.");
          } else {
            if (!host && persistedRoom?.selected_question_id) {
              setSelectedQuestionId(persistedRoom.selected_question_id);
            }

            setRoomStatus("lobby");
            setMessage(host ? "Room created. Share the link." : "Joined room. Waiting in lobby.");
          }

          await channel.track({ clientId, username: nextUsername.trim(), correctCount: 0, guessesRemaining: 0, status: "lobby" } satisfies PlayerPresence);
        }
      });
  }

  function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    connectToRoom(makeRoomCode(), username, true);
  }

  function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    connectToRoom(joinCode, username, false);
  }

  async function shareRoomLink() {
    if (!roomLink) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Free Time room", text: `Join my Free Time room: ${roomCode}`, url: roomLink });
        setMessage("Room link shared.");
        return;
      }

      await navigator.clipboard.writeText(roomLink);
      setMessage("Room link copied. Send it to your mates.");
    } catch {
      setMessage("Could not copy the link. You can still share the room code.");
    }
  }

  async function startRoom() {
    if (!channelRef.current || !isHost) {
      return;
    }

    const nextQuestion = selectedRoomQuestion;

    if (!nextQuestion) {
      setMessage("No questions in this category.");
      return;
    }
    const saved = await savePersistedRoom(roomCode, "playing", nextQuestion, nextQuestion.id);

    if (!saved) {
      return;
    }

    const payload: BroadcastPayload = { type: "room-start", question: nextQuestion, startedAt: Date.now() };
    channelRef.current.send({ type: "broadcast", event: "room-event", payload });
  }

  function leaveRoom() {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    window.history.replaceState(null, "", window.location.pathname);
    setRoomStatus("setup");
    setRoomCode("");
    setJoinCode("");
    setPlayers([]);
    setQuestion(null);
    setFoundAnswerIds([]);
    setWrongGuesses([]);
    setMessage("Create or join a room to start.");
  }

  async function resetRoom() {
    if (!channelRef.current || !isHost) {
      return;
    }

    const saved = await savePersistedRoom(roomCode, "lobby", null, selectedRoomQuestion?.id ?? null);

    if (!saved) {
      return;
    }

    channelRef.current.send({ type: "broadcast", event: "room-event", payload: { type: "room-reset" } satisfies BroadcastPayload });
  }

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question || roomStatus !== "playing") {
      return;
    }

    const cleanedGuess = normalize(guess);

    if (!cleanedGuess) {
      setMessage("Type an answer first.");
      return;
    }

    const matchedAnswer = question.answers.find((answer) => answer.aliases.some((alias) => normalize(alias) === cleanedGuess));

    if (!matchedAnswer) {
      setWrongGuesses((current) => [...current, guess.trim()]);
      setGuess("");
      setMessage("Wrong. One guess gone.");
      return;
    }

    if (foundSet.has(matchedAnswer.id)) {
      setGuess("");
      setMessage("Already found. Try another answer.");
      return;
    }

    setFoundAnswerIds((current) => [...current, matchedAnswer.id]);
    setGuess("");
    setMessage("Correct. Leaderboard updated.");
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8 pt-5 text-brand-cream sm:px-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <Logo variant="compact" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-brand-lime/75">Realtime rooms</p>
        </div>
        <button type="button" onClick={onBack} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-3 text-sm font-black text-brand-cream shadow-brand transition active:scale-95">
          Solo
        </button>
      </header>

      {roomStatus === "setup" ? (
        <section className="space-y-4">
          <section className="relative overflow-hidden rounded-lg border border-brand-cream/10 bg-brand-panel/90 p-5 text-brand-cream shadow-brand">
            <h2 className="text-2xl font-black leading-tight">Create or join a room</h2>
            <p className="mt-3 text-sm font-semibold text-brand-cream/75">Category: {selectedCategory}</p>
            <p className="mt-2 text-sm font-semibold text-brand-cream/75">{message}</p>
          </section>

          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/65">
            Host question
            <select value={selectedQuestionId} onChange={(event) => setSelectedQuestionId(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-4 py-4 text-base font-bold normal-case tracking-normal text-brand-cream shadow-sm">
              {questions.length === 0 ? <option value="">No questions in this category</option> : null}
              {questions.map((roomQuestion) => (
                <option key={roomQuestion.id} value={roomQuestion.id}>
                  {roomQuestion.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/65">
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-4 py-4 text-base font-bold normal-case tracking-normal text-brand-cream shadow-sm" placeholder="Your name" />
          </label>

          <form onSubmit={createRoom}>
            <button type="submit" className="w-full rounded-lg bg-brand-lime px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-brand transition active:scale-95">
              Create room
            </button>
          </form>

          <form onSubmit={joinRoom} className="rounded-lg border border-brand-cream/10 bg-brand-panel/85 p-3 shadow-sm">
            <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/65">
              Room code
              <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase().slice(0, 5))} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-4 py-4 text-center text-xl font-black tracking-[0.2em] text-brand-cream" placeholder="ABCDE" maxLength={5} />
            </label>
            <button type="submit" className="mt-3 w-full rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95">
              Join room
            </button>
          </form>
        </section>
      ) : null}

      {roomStatus === "lobby" ? (
        <section className="space-y-4">
          <section className="relative overflow-hidden rounded-lg border border-brand-cream/10 bg-brand-panel/90 p-5 text-brand-cream shadow-brand">
            <p className="text-sm font-semibold text-brand-cream/70">Room code</p>
            <h2 className="mt-2 text-5xl font-black tracking-[0.18em]">{roomCode}</h2>
            {roomLink ? (
              <div className="mt-4 rounded-lg border border-brand-lime/20 bg-brand-bg/70 p-3">
                <p className="break-all text-xs font-bold text-brand-cream/65">{roomLink}</p>
                <button type="button" onClick={shareRoomLink} className="mt-3 w-full rounded-lg bg-brand-lime px-4 py-3 text-sm font-black uppercase text-brand-bg shadow-brand transition active:scale-95">
                  Copy room link
                </button>
              </div>
            ) : null}
            <p className="mt-3 text-sm font-semibold text-brand-cream/75">{message}</p>
          </section>

          <Leaderboard players={players} />

          {isHost ? (
            <label className="block text-sm font-black uppercase tracking-wide text-brand-cream/65">
              Pick question
              <select value={selectedQuestionId} onChange={(event) => setSelectedQuestionId(event.target.value)} className="mt-2 w-full rounded-md border border-brand-cream/10 bg-brand-bg px-4 py-4 text-base font-bold normal-case tracking-normal text-brand-cream shadow-sm">
                {questions.length === 0 ? <option value="">No questions in this category</option> : null}
                {questions.map((roomQuestion) => (
                  <option key={roomQuestion.id} value={roomQuestion.id}>
                    {roomQuestion.title}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs font-bold normal-case tracking-normal text-brand-cream/55">
                Everyone will get this same list when you start the room.
              </span>
            </label>
          ) : (
            <div className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-bold text-brand-cream/65 shadow-sm">
              Waiting for the host to pick the question.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={startRoom} disabled={!isHost || !selectedRoomQuestion} className="rounded-lg bg-brand-lime px-4 py-4 text-sm font-black uppercase text-brand-bg shadow-brand transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
              Start
            </button>
            <button type="button" onClick={leaveRoom} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95">
              Leave
            </button>
          </div>
        </section>
      ) : null}

      {(roomStatus === "playing" || roomStatus === "finished") && question ? (
        <>
          <section className="relative overflow-hidden rounded-lg border border-brand-cream/10 bg-brand-panel/90 p-5 text-brand-cream shadow-brand">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-cream/70">Room {roomCode}</p>
                <h2 className="mt-3 text-2xl font-black leading-tight">{question.title}</h2>
              </div>
              <div className="rounded-lg bg-brand-gold px-3 py-2 text-xl font-black text-brand-bg">{guessesRemaining}</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-brand-cream/80">{question.hint}</p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center text-xs font-black uppercase tracking-wide text-brand-cream/80">
              <div className="rounded-lg bg-brand-cream/10 px-2 py-3"><span className="block text-lg text-brand-cream">{foundAnswerIds.length}/{question.answers.length}</span>Found</div>
              <div className="rounded-lg bg-brand-cream/10 px-2 py-3"><span className="block text-lg text-brand-cream">{guessesRemaining}</span>Guesses</div>
            </div>
          </section>

          <form onSubmit={submitGuess} className="sticky top-0 z-10 -mx-4 mt-5 bg-transparent px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex gap-2 rounded-lg bg-brand-panel p-2 shadow-brand">
              <input value={guess} onChange={(event) => setGuess(event.target.value)} disabled={roomStatus !== "playing"} placeholder={roomStatus === "playing" ? "Type an answer" : "Finished"} className="min-w-0 flex-1 rounded-md border border-brand-cream/10 bg-brand-bg px-4 py-4 text-base font-semibold text-brand-cream placeholder:text-brand-cream/45 disabled:opacity-60" autoComplete="off" />
              <button type="submit" disabled={roomStatus !== "playing"} className="min-w-20 rounded-md bg-brand-lime px-4 py-3 text-sm font-black uppercase text-brand-bg transition active:scale-95 disabled:cursor-not-allowed disabled:bg-brand-cream/20">
                Guess
              </button>
            </div>
          </form>

          <p className="min-h-7 px-1 text-sm font-bold text-brand-cream/75" aria-live="polite">{message}</p>

          <section className="mt-4 grid grid-cols-2 gap-3">
            {question.answers.map((answer, index) => {
              const isFound = foundSet.has(answer.id);
              return (
                <div key={answer.id} className={["min-h-16 rounded-lg border px-4 py-3 transition", isFound ? "border-brand-lime/60 bg-brand-lime/10 text-brand-cream shadow-brand answer-pop" : roomStatus === "finished" ? "border-brand-gold/40 bg-brand-gold/10 text-brand-cream/70" : "border-brand-cream/10 bg-brand-panel/70 text-brand-cream/35"].join(" ")}>
                  <p className="text-xs font-black uppercase text-brand-cream/35">#{index + 1}</p>
                  <p className="mt-1 break-words text-sm font-black">{isFound || roomStatus === "finished" ? answer.label : "Hidden"}</p>
                </div>
              );
            })}
          </section>

          <Leaderboard players={players} />

          <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
            <button type="button" onClick={resetRoom} disabled={!isHost} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
              Lobby
            </button>
            <button type="button" onClick={leaveRoom} className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-black uppercase text-brand-cream shadow-sm transition active:scale-95">
              Leave
            </button>
          </div>
        </>
      ) : null}
    </main>
  );
}

function Leaderboard({ players }: { players: PlayerPresence[] }) {
  return (
    <section className="mt-5">
      <h2 className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime/75">Live leaderboard</h2>
      <div className="mt-2 space-y-2">
        {players.length === 0 ? (
          <div className="rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-4 text-sm font-bold text-brand-cream/60 shadow-sm">Waiting for players</div>
        ) : (
          players.map((player, index) => (
            <div key={player.clientId} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-brand-cream/10 bg-brand-panel px-4 py-3 shadow-sm">
              <span className="text-sm font-black text-brand-cream/35">#{index + 1}</span>
              <span className="min-w-0 truncate text-sm font-black text-brand-cream">{player.username}</span>
              <span className="text-sm font-bold text-brand-cream/65">{player.correctCount} correct</span>
              <span className="text-sm font-bold text-brand-cream/65">{player.guessesRemaining} left</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
