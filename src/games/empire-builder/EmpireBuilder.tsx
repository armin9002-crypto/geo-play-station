import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countryByIso2, type Country } from "../shared/countryData";
import { GameShell, ResultsScreen } from "../shared/GameShell";
import { shuffle } from "../shared/gameUtils";
import EmpireMap from "./EmpireMap";
import { empires, type EmpireDifficulty, type EmpireEntry } from "./data";

type DifficultyMode = EmpireDifficulty | "mixed";

const ROUND_COUNT = 8;
const MODES: { label: string; value: DifficultyMode }[] = [
  { label: "Mixed", value: "mixed" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

interface RoundResult {
  points: number;
  possible: number;
  correct: number;
  missed: number;
  wrong: number;
  perfect: boolean;
}

function buildRounds(mode: DifficultyMode): EmpireEntry[] {
  const pool = mode === "mixed" ? empires : empires.filter((empire) => empire.difficulty === mode);
  return shuffle(pool).slice(0, ROUND_COUNT);
}

function countriesForEmpire(empire: EmpireEntry): Country[] {
  return empire.countries.map((iso) => countryByIso2[iso]).filter(Boolean);
}

function scoreRound(selectedIds: Set<string>, correctIds: Set<string>): RoundResult {
  const correct = [...selectedIds].filter((id) => correctIds.has(id)).length;
  const wrong = [...selectedIds].filter((id) => !correctIds.has(id)).length;
  const missed = [...correctIds].filter((id) => !selectedIds.has(id)).length;
  const perfect = wrong === 0 && missed === 0;
  const possible = correctIds.size * 2 + 3;
  const points = Math.max(0, correct * 2 - wrong + (perfect ? 3 : 0));
  return { points, possible, correct, missed, wrong, perfect };
}

export default function EmpireBuilder() {
  const [mode, setMode] = useState<DifficultyMode>("mixed");
  const [rounds, setRounds] = useState<EmpireEntry[]>(() => buildRounds("mixed"));
  const [index, setIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [viewMode, setViewMode] = useState<"focus" | "world">("focus");

  const round = rounds[index];
  const finished = index >= rounds.length;
  const answerCountries = useMemo(() => (round ? countriesForEmpire(round) : []), [round]);
  const correctIds = useMemo(
    () => new Set(answerCountries.map((country) => country.id)),
    [answerCountries],
  );
  const currentResult = revealed ? scoreRound(selectedIds, correctIds) : null;
  const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
  const totalPossible = results.reduce((sum, result) => sum + result.possible, 0);
  const totalCorrect = results.reduce((sum, result) => sum + result.correct, 0);
  const totalAttempts = results.reduce(
    (sum, result) => sum + result.correct + result.missed + result.wrong,
    0,
  );
  const overallAccuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const restart = (nextMode = mode) => {
    setMode(nextMode);
    setRounds(buildRounds(nextMode));
    setIndex(0);
    setSelectedIds(new Set());
    setRevealed(false);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setViewMode("focus");
  };

  const toggleCountry = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (revealed || !round) return;
    const result = scoreRound(selectedIds, correctIds);
    setResults((items) => [...items, result]);
    setRevealed(true);
    if (result.perfect) {
      setStreak((current) => {
        const next = current + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const nextRound = () => {
    setSelectedIds(new Set());
    setRevealed(false);
    setViewMode("focus");
    setIndex((current) => current + 1);
  };

  const stats = useMemo(
    () => [
      { label: "Score", value: `${totalPoints} / ${totalPossible || rounds.length}` },
      { label: "Streak", value: streak, accent: streak >= 2 },
      { label: "Round", value: `${Math.min(index + 1, rounds.length)} of ${rounds.length}` },
      { label: "Picked", value: selectedIds.size },
    ],
    [totalPoints, totalPossible, rounds.length, streak, index, selectedIds.size],
  );

  if (finished) {
    return (
      <GameShell title="Empire Builder" subtitle="Map the reach of history">
        <div className="mx-auto max-w-2xl">
          <ResultsScreen
            score={totalPoints}
            total={totalPossible}
            bestStreak={bestStreak}
            onRestart={() => restart()}
            unit="points"
          />
          <div className="-mt-10 mb-12 text-center text-sm text-muted-foreground">
            Overall selection accuracy:{" "}
            <span className="font-semibold text-foreground">{overallAccuracy}%</span>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Empire Builder" subtitle="Map the reach of history" stats={stats}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {MODES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={mode === item.value ? "default" : "outline"}
              onClick={() => restart(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="rounded-2xl border border-border bg-card/45 p-3 shadow-xl shadow-black/25 backdrop-blur">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
                  {round.region} / {round.difficulty}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{round.name}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode("world")}
                >
                  World view
                </Button>
                <Button type="button" size="sm" onClick={() => setViewMode("focus")}>
                  Focus map
                </Button>
              </div>
            </div>

            <EmpireMap
              selectedIds={selectedIds}
              correctIds={correctIds}
              revealed={revealed}
              focusIds={answerCountries.map((country) => country.id)}
              viewMode={viewMode}
              onToggleCountry={toggleCountry}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs leading-5 text-muted-foreground">
                Rule: a modern country counts if a meaningful portion of its current territory was
                controlled, settled, or incorporated by the empire at or near its peak.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                  disabled={revealed || selectedIds.size === 0}
                >
                  Clear selections
                </Button>
                {!revealed ? (
                  <Button type="button" onClick={submit} disabled={selectedIds.size === 0}>
                    Submit
                  </Button>
                ) : (
                  <Button type="button" onClick={nextRound}>
                    {index + 1 === rounds.length ? "See results" : "Next round ->"}
                  </Button>
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-border bg-card/60 p-4 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
              At or near peak
            </p>
            <h3 className="mt-2 text-xl font-bold">{round.era}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{round.description}</p>
            {round.notes && (
              <p className="mt-3 rounded-lg border border-border bg-background/45 p-3 text-xs leading-5 text-muted-foreground">
                {round.notes}
              </p>
            )}
            <Legend revealed={revealed} />
            {currentResult && (
              <RoundSummary result={currentResult} answerCountries={answerCountries} />
            )}
          </aside>
        </div>
      </div>
    </GameShell>
  );
}

function Legend({ revealed }: { revealed: boolean }) {
  return (
    <div className="mt-5 grid gap-2 text-xs text-muted-foreground">
      <LegendItem
        color="var(--color-amber)"
        label={revealed ? "Missed correct country" : "Selected country"}
      />
      <LegendItem color="var(--color-success)" label="Correct selection" />
      <LegendItem color="var(--color-danger)" label="Incorrect selection" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm border border-white/20" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function RoundSummary({
  result,
  answerCountries,
}: {
  result: RoundResult;
  answerCountries: Country[];
}) {
  const accuracy = Math.round(
    (result.correct / (result.correct + result.missed + result.wrong || 1)) * 100,
  );

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Metric label="Round score" value={`${result.points} / ${result.possible}`} />
        <Metric label="Accuracy" value={`${accuracy}%`} />
        <Metric label="Missed" value={result.missed} />
        <Metric label="Wrong" value={result.wrong} />
      </div>
      {result.perfect && (
        <p className="mt-3 text-sm font-semibold text-amber">Perfect round bonus earned.</p>
      )}
      <div className="mt-4 max-h-44 overflow-auto rounded-lg border border-border bg-background/35 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Accepted countries
        </p>
        <div className="flex flex-wrap gap-1.5">
          {answerCountries.map((country) => (
            <span
              key={country.id}
              className="rounded-full border border-border bg-card px-2 py-1 text-xs text-foreground"
            >
              {country.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

const missingEmpireCountryCodes = empires.flatMap((empire) =>
  empire.countries.filter((iso) => !countryByIso2[iso]).map((iso) => `${empire.id}:${iso}`),
);

if (import.meta.env.DEV && missingEmpireCountryCodes.length) {
  console.warn("Empire Builder has unmapped country codes", missingEmpireCountryCodes);
}
