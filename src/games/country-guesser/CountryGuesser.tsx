import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import WorldMap from "./WorldMap";
import { countries, type Country } from "./countryData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  correct: Country;
  options: Country[];
}

function buildRounds(): Round[] {
  const order = shuffle(countries);
  return order.map((correct) => {
    const sameContinent = countries.filter(
      (c) => c.continent === correct.continent && c.id !== correct.id,
    );
    const pool = sameContinent.length >= 3
      ? sameContinent
      : countries.filter((c) => c.id !== correct.id);
    const wrongs = shuffle(pool).slice(0, 3);
    return { correct, options: shuffle([correct, ...wrongs]) };
  });
}

export default function CountryGuesser() {
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const total = rounds.length;
  const round = rounds[index];
  const finished = index >= total;

  const isCorrect = picked !== null && picked === round?.correct.id;

  const handlePick = (id: string) => {
    if (picked) return;
    setPicked(id);
    if (id === round.correct.id) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setRounds(buildRounds());
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
  };

  const accuracy = useMemo(
    () => (total ? Math.round((score / total) * 100) : 0),
    [score, total],
  );

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Game complete
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          {score} <span className="text-muted-foreground">/ {total}</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {accuracy}% accuracy · best streak {bestStreak}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={handleRestart}>
            Play Again
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/">Back to hub</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
      {/* Top bar */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← GeoGames
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Stat label="Score" value={`${score} / ${total}`} />
          <Stat label="Streak" value={streak} accent={streak >= 3} />
          <Stat
            label="Country"
            value={`${index + 1} of ${total}`}
          />
        </div>
      </header>

      <div className="rounded-xl border border-border bg-card/40 p-2 sm:p-3">
        <WorldMap
          highlightedId={round.correct.id}
          revealedId={picked ? round.correct.id : null}
          revealStatus={picked ? (isCorrect ? "correct" : "wrong") : null}
        />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Which country is highlighted in amber?
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {round.options.map((opt) => {
          const isPickedOpt = picked === opt.id;
          const isAnswer = opt.id === round.correct.id;
          const showCorrect = picked !== null && isAnswer;
          const showWrong = picked !== null && isPickedOpt && !isAnswer;
          return (
            <button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              disabled={picked !== null}
              className={cn(
                "rounded-lg border border-border bg-card px-4 py-3 text-left text-base font-medium transition-all",
                "hover:border-amber/60 hover:bg-card/80",
                "disabled:cursor-default",
                showCorrect &&
                  "border-success/60 bg-success text-success-foreground hover:bg-success",
                showWrong &&
                  "border-danger/60 bg-danger text-danger-foreground hover:bg-danger",
              )}
            >
              {opt.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex min-h-12 items-center justify-end">
        {picked && (
          <Button size="lg" onClick={handleNext}>
            {index + 1 === total ? "See results" : "Next →"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card/60 px-3 py-1.5",
        accent && "border-amber/50 text-amber",
      )}
    >
      <span className="mr-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
