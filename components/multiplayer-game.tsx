"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { TriviaQuestion } from "@/lib/types";

type RoomStatus = "setup" | "lobby" | "playing" | "finished";
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
  const [guess, setGuess] = useState("");
  const [foundAnswerIds, setFoundAnswerIds] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [message, setMessage] = useState("Create or join a room to start.");

  const foundSet = useMemo(() => new Set(foundAnswerIds), [foundAnswerIds]);
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

  function connectToRoom(nextRoomCode: string, nextUsername: string, host: boolean) {
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
          setUsername(nextUsername.trim());
          setIsHost(host);
          setRoomStatus("lobby");
          setMessage(host ? "Room created. Share the code." : "Joined room. Waiting in lobby.");
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

  function startRoom() {
    if (!channelRef.current || !isHost) {
      return;
    }

    const nextQuestion = questions[Math.floor(Math.random() * questions.length)];

    if (!nextQuestion) {
      setMessage("No questions in this category.");
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

    setRoomStatus("setup");
    setRoomCode("");
    setJoinCode("");
    setPlayers([]);
    setQuestion(null);
    setFoundAnswerIds([]);
    setWrongGuesses([]);
    setMessage("Create or join a room to start.");
  }

  function resetRoom() {
    if (!channelRef.current || !isHost) {
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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8 pt-5 sm:px-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-pitch/70">Realtime rooms</p>
          <h1 className="mt-1 text-4xl font-black leading-none text-pitch">Free Time</h1>
        </div>
        <button type="button" onClick={onBack} className="rounded-lg bg-pitch px-4 py-3 text-sm font-black text-line shadow-sm transition active:scale-95">
          Solo
        </button>
      </header>

      {roomStatus === "setup" ? (
        <section className="space-y-4">
          <section className="rounded-lg bg-pitch p-5 text-line shadow-soft">
            <h2 className="text-2xl font-black leading-tight">Create or join a room</h2>
            <p className="mt-3 text-sm font-semibold text-line/75">Category: {selectedCategory}</p>
            <p className="mt-2 text-sm font-semibold text-line/75">{message}</p>
          </section>

          <label className="block text-sm font-black uppercase tracking-wide text-pitch/70">
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-md border-0 bg-white px-4 py-4 text-base font-bold normal-case tracking-normal text-ink shadow-sm" placeholder="Your name" />
          </label>

          <form onSubmit={createRoom}>
            <button type="submit" className="w-full rounded-lg bg-coral px-4 py-4 text-sm font-black uppercase text-white shadow-sm transition active:scale-95">
              Create room
            </button>
          </form>

          <form onSubmit={joinRoom} className="rounded-lg bg-white p-3 shadow-sm">
            <label className="block text-sm font-black uppercase tracking-wide text-pitch/70">
              Room code
              <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase().slice(0, 5))} className="mt-2 w-full rounded-md border-0 bg-[#F4F7F1] px-4 py-4 text-center text-xl font-black tracking-[0.2em] text-ink" placeholder="ABCDE" maxLength={5} />
            </label>
            <button type="submit" className="mt-3 w-full rounded-lg bg-pitch px-4 py-4 text-sm font-black uppercase text-line shadow-sm transition active:scale-95">
              Join room
            </button>
          </form>
        </section>
      ) : null}

      {roomStatus === "lobby" ? (
        <section className="space-y-4">
          <section className="rounded-lg bg-pitch p-5 text-line shadow-soft">
            <p className="text-sm font-semibold text-line/70">Room code</p>
            <h2 className="mt-2 text-5xl font-black tracking-[0.18em]">{roomCode}</h2>
            <p className="mt-3 text-sm font-semibold text-line/75">{message}</p>
          </section>

          <Leaderboard players={players} />

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={startRoom} disabled={!isHost} className="rounded-lg bg-coral px-4 py-4 text-sm font-black uppercase text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
              Start
            </button>
            <button type="button" onClick={leaveRoom} className="rounded-lg bg-white px-4 py-4 text-sm font-black uppercase text-pitch shadow-sm transition active:scale-95">
              Leave
            </button>
          </div>
        </section>
      ) : null}

      {(roomStatus === "playing" || roomStatus === "finished") && question ? (
        <>
          <section className="rounded-lg bg-pitch p-5 text-line shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-line/70">Room {roomCode}</p>
                <h2 className="mt-3 text-2xl font-black leading-tight">{question.title}</h2>
              </div>
              <div className="rounded-lg bg-boot px-3 py-2 text-xl font-black text-ink">{guessesRemaining}</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-line/80">{question.hint}</p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center text-xs font-black uppercase tracking-wide text-line/80">
              <div className="rounded-lg bg-line/10 px-2 py-3"><span className="block text-lg text-line">{foundAnswerIds.length}/{question.answers.length}</span>Found</div>
              <div className="rounded-lg bg-line/10 px-2 py-3"><span className="block text-lg text-line">{guessesRemaining}</span>Guesses</div>
            </div>
          </section>

          <form onSubmit={submitGuess} className="sticky top-0 z-10 -mx-4 mt-5 bg-transparent px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex gap-2 rounded-lg bg-white p-2 shadow-soft">
              <input value={guess} onChange={(event) => setGuess(event.target.value)} disabled={roomStatus !== "playing"} placeholder={roomStatus === "playing" ? "Type an answer" : "Finished"} className="min-w-0 flex-1 rounded-md border-0 bg-[#F4F7F1] px-4 py-4 text-base font-semibold text-ink placeholder:text-ink/45 disabled:opacity-60" autoComplete="off" />
              <button type="submit" disabled={roomStatus !== "playing"} className="min-w-20 rounded-md bg-coral px-4 py-3 text-sm font-black uppercase text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-ink/25">
                Guess
              </button>
            </div>
          </form>

          <p className="min-h-7 px-1 text-sm font-bold text-pitch/80" aria-live="polite">{message}</p>

          <section className="mt-4 grid grid-cols-2 gap-3">
            {question.answers.map((answer, index) => {
              const isFound = foundSet.has(answer.id);
              return (
                <div key={answer.id} className={["min-h-16 rounded-lg border px-4 py-3 transition", isFound ? "border-pitch bg-white text-pitch shadow-sm" : roomStatus === "finished" ? "border-coral/40 bg-coral/10 text-ink/75" : "border-pitch/10 bg-white/72 text-ink/35"].join(" ")}>
                  <p className="text-xs font-black uppercase text-ink/35">#{index + 1}</p>
                  <p className="mt-1 break-words text-sm font-black">{isFound || roomStatus === "finished" ? answer.label : "Hidden"}</p>
                </div>
              );
            })}
          </section>

          <Leaderboard players={players} />

          <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
            <button type="button" onClick={resetRoom} disabled={!isHost} className="rounded-lg bg-white px-4 py-4 text-sm font-black uppercase text-pitch shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">
              Lobby
            </button>
            <button type="button" onClick={leaveRoom} className="rounded-lg bg-pitch px-4 py-4 text-sm font-black uppercase text-line shadow-sm transition active:scale-95">
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
      <h2 className="text-sm font-black uppercase tracking-[0.18em] text-pitch/65">Live leaderboard</h2>
      <div className="mt-2 space-y-2">
        {players.length === 0 ? (
          <div className="rounded-lg bg-white px-4 py-4 text-sm font-bold text-ink/60 shadow-sm">Waiting for players</div>
        ) : (
          players.map((player, index) => (
            <div key={player.clientId} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
              <span className="text-sm font-black text-ink/35">#{index + 1}</span>
              <span className="min-w-0 truncate text-sm font-black text-pitch">{player.username}</span>
              <span className="text-sm font-bold text-ink/70">{player.correctCount} correct</span>
              <span className="text-sm font-bold text-ink/70">{player.guessesRemaining} left</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
