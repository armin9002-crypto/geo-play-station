import { useMemo, useState } from "react";
import { countries, type Country } from "../shared/countryData";
import { GameShell, ResultsScreen } from "../shared/GameShell";
import { ChoiceButton, pickDistractors, shuffle } from "../shared/gameUtils";
import { Button } from "@/components/ui/button";

const ROUND_COUNT = 20;

interface Round {
  correct: Country;
  options: Country[]; // we ask for capital of correct.name, options are capitals of these countries
}

function buildRounds(): Round[] {
  const order = shuffle(countries).slice(0, ROUND_COUNT);
  return order.map((correct) => {
    const wrongs = pickDistractors(countries, correct, 3);
    return { correct, options: shuffle([correct, ...wrongs]) };
  });
}

export default function CapitalQuiz() {
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const total = rounds.length;
  const round = rounds[index];
  const finished = index >= total;

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

  const stats = useMemo(
    () => [
      { label: "Score", value: `${score} / ${total}` },
      { label: "Streak", value: streak, accent: streak >= 3 },
      { label: "Question", value: `${Math.min(index + 1, total)} of ${total}` },
    ],
    [score, total, streak, index],
  );

  if (finished) {
    return (
      <GameShell title="Capital Quiz" subtitle="Match countries to their capital cities">
        <ResultsScreen
          score={score}
          total={total}
          bestStreak={bestStreak}
          onRestart={handleRestart}
          unit="questions"
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Capital Quiz" subtitle="Match countries to their capital cities" stats={stats}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center shadow-xl shadow-black/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">
            What is the capital of
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-5xl">
            {round.correct.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{round.correct.continent}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {round.options.map((opt, i) => {
            const isAnswer = opt.id === round.correct.id;
            const isPickedOpt = picked === opt.id;
            const state =
              picked === null
                ? "idle"
                : isAnswer
                ? "correct"
                : isPickedOpt
                ? "wrong"
                : "muted";
            return (
              <ChoiceButton
                key={opt.id}
                label={opt.capital}
                prefix={String.fromCharCode(65 + i)}
                onClick={() => handlePick(opt.id)}
                disabled={picked !== null}
                state={state}
              />
            );
          })}
        </div>

        <div className="mt-5 flex min-h-12 items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {picked && (
              picked === round.correct.id
                ? <span className="text-success">✓ Correct — {round.correct.capital}</span>
                : <span className="text-danger">✗ Answer: {round.correct.capital}</span>
            )}
          </p>
          {picked && (
            <Button size="lg" onClick={handleNext}>
              {index + 1 === total ? "See results" : "Next →"}
            </Button>
          )}
        </div>
      </div>
    </GameShell>
  );
}
