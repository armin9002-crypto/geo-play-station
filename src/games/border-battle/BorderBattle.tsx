import { useMemo, useRef, useState } from "react";
import {
  countries,
  countryByIso2,
  flagEmoji,
  type Country,
} from "../shared/countryData";
import { GameShell, ResultsScreen } from "../shared/GameShell";
import { shuffle } from "../shared/gameUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROUND_COUNT = 5;
const MIN_BORDERS = 3;

interface Round {
  country: Country;
  neighbors: Country[];
}

function buildRounds(): Round[] {
  const candidates = countries.filter((c) => c.borders.length >= MIN_BORDERS);
  return shuffle(candidates)
    .slice(0, ROUND_COUNT)
    .map((country) => ({
      country,
      neighbors: country.borders
        .map((iso) => countryByIso2[iso])
        .filter(Boolean),
    }));
}

/** Normalize a guess for comparison: lowercase, strip diacritics & non-letters. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

const COUNTRY_NAME_INDEX: Record<string, Country> = (() => {
  const idx: Record<string, Country> = {};
  for (const c of countries) {
    idx[normalize(c.name)] = c;
  }
  // Common aliases
  const aliases: Record<string, string> = {
    usa: "US",
    us: "US",
    unitedstatesofamerica: "US",
    america: "US",
    uk: "GB",
    britain: "GB",
    greatbritain: "GB",
    england: "GB",
    drc: "CD",
    drcongo: "CD",
    democraticrepublicofcongo: "CD",
    congokinshasa: "CD",
    congobrazzaville: "CG",
    congo: "CG",
    ivorycoast: "CI",
    cotedivoire: "CI",
    burma: "MM",
    czechia: "CZ",
    swaziland: "SZ",
    eastTimor: "TL",
    easttimor: "TL",
    macedonia: "MK",
    vatican: "VA",
    holysee: "VA",
    palestinianterritories: "PS",
    westernsahara: "EH", // not in list — guard below
  };
  for (const [k, iso] of Object.entries(aliases)) {
    const c = countryByIso2[iso];
    if (c) idx[k] = c;
  }
  return idx;
})();

export default function BorderBattle() {
  const [rounds] = useState<Round[]>(() => buildRounds());
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set()); // iso2
  const [reveal, setReveal] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [input, setInput] = useState("");
  const [flash, setFlash] = useState<{ kind: "ok" | "dup" | "miss"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const round = rounds[index];
  const finished = index >= rounds.length;

  const totalNeighbors = useMemo(
    () => rounds.reduce((sum, r) => sum + r.neighbors.length, 0),
    [rounds],
  );
  const totalScore = scores.reduce((a, b) => a + b, 0);

  const submitGuess = () => {
    if (!round || reveal) return;
    const key = normalize(input);
    if (!key) return;
    const country = COUNTRY_NAME_INDEX[key];
    setInput("");

    if (!country) {
      setFlash({ kind: "miss", text: `"${input}" not recognized` });
      return;
    }
    const isNeighbor = round.country.borders.includes(country.iso2);
    if (!isNeighbor) {
      setFlash({ kind: "miss", text: `${country.name} doesn't border ${round.country.name}` });
      return;
    }
    if (found.has(country.iso2)) {
      setFlash({ kind: "dup", text: `Already found ${country.name}` });
      return;
    }
    const next = new Set(found);
    next.add(country.iso2);
    setFound(next);
    setFlash({ kind: "ok", text: `✓ ${country.name}` });
  };

  const finishRound = () => {
    setReveal(true);
    const got = found.size;
    setScores((s) => [...s, got]);
    if (got === round.neighbors.length) {
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  };

  const nextRound = () => {
    setIndex((i) => i + 1);
    setFound(new Set());
    setReveal(false);
    setFlash(null);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleRestart = () => {
    window.location.reload(); // simplest: rebuild rounds from scratch
  };

  const stats = [
    { label: "Score", value: `${totalScore} / ${totalNeighbors}` },
    { label: "Streak", value: streak, accent: streak >= 2 },
    { label: "Round", value: `${Math.min(index + 1, rounds.length)} of ${rounds.length}` },
  ];

  if (finished) {
    return (
      <GameShell title="Border Battle" subtitle="Name every neighbor">
        <ResultsScreen
          score={totalScore}
          total={totalNeighbors}
          bestStreak={bestStreak}
          onRestart={handleRestart}
          unit="neighbors"
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Border Battle" subtitle="Name every neighbor" stats={stats}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center shadow-xl shadow-black/20 backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">
            Name every country bordering
          </p>
          <h2 className="mt-2 flex items-center justify-center gap-3 text-3xl font-bold sm:text-5xl">
            <span className="text-4xl sm:text-5xl">{flagEmoji(round.country.iso2)}</span>
            {round.country.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {found.size} of {round.neighbors.length} neighbors found
          </p>
        </div>

        {!reveal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitGuess();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a country name…"
              className="h-11 flex-1 rounded-md border border-border bg-card/70 px-4 text-base outline-none transition-colors focus:border-amber/60"
            />
            <Button type="submit" size="lg">Guess</Button>
          </form>
        )}

        {flash && !reveal && (
          <p
            className={cn(
              "mt-2 text-sm",
              flash.kind === "ok" && "text-success",
              flash.kind === "dup" && "text-amber",
              flash.kind === "miss" && "text-danger",
            )}
          >
            {flash.text}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {round.neighbors.map((n) => {
            const isFound = found.has(n.iso2);
            const showReveal = reveal && !isFound;
            return (
              <div
                key={n.iso2}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-2.5 text-sm transition-all",
                  isFound && "border-success/60 bg-success/15 text-foreground",
                  showReveal && "border-danger/40 bg-danger/10 text-muted-foreground",
                )}
              >
                <span className="text-lg">
                  {isFound || reveal ? flagEmoji(n.iso2) : "❓"}
                </span>
                <span className="truncate font-medium">
                  {isFound || reveal ? n.name : "—"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {!reveal ? (
            <Button variant="secondary" onClick={finishRound}>
              Give up / Reveal
            </Button>
          ) : (
            <Button size="lg" onClick={nextRound}>
              {index + 1 === rounds.length ? "See results" : "Next round →"}
            </Button>
          )}
        </div>
      </div>
    </GameShell>
  );
}
