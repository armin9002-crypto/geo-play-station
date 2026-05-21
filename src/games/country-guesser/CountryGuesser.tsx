import { useMemo, useState } from "react";
import WorldMap from "./WorldMap";
import { countries, type Country } from "../shared/countryData";
import { GameShell, ResultsScreen } from "../shared/GameShell";
import { ChoiceButton, pickDistractors, shuffle } from "../shared/gameUtils";
import { Button } from "@/components/ui/button";

interface Round {
  correct: Country;
  options: Country[];
}

const ROUND_COUNT = 20;

function buildRounds(): Round[] {
  const order = shuffle(countries).slice(0, ROUND_COUNT);
  return order.map((correct) => {
    const wrongs = pickDistractors(countries, correct, 3);
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
  const [mapView, setMapView] = useState<"target" | "world">("target");

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
    setMapView("target");
    setIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setRounds(buildRounds());
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setMapView("target");
  };

  const stats = useMemo(
    () => [
      { label: "Score", value: `${score} / ${total}` },
      { label: "Streak", value: streak, accent: streak >= 3 },
      { label: "Country", value: `${Math.min(index + 1, total)} of ${total}` },
    ],
    [score, total, streak, index],
  );

  if (finished) {
    return (
      <GameShell title="Country Guesser" subtitle="Identify highlighted countries">
        <ResultsScreen
          score={score}
          total={total}
          bestStreak={bestStreak}
          onRestart={handleRestart}
          unit="countries"
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Country Guesser" subtitle="Identify highlighted countries" stats={stats}>
      <div className="rounded-2xl border border-border bg-card/40 p-2 shadow-xl shadow-black/30 backdrop-blur sm:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMapView("world")}
            disabled={mapView === "world"}
          >
            World view
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setMapView("target")}
            disabled={mapView === "target"}
          >
            Zoom to target
          </Button>
        </div>
        <WorldMap
          highlightedId={round.correct.id}
          revealedId={picked ? round.correct.id : null}
          revealStatus={picked ? (isCorrect ? "correct" : "wrong") : null}
          viewMode={mapView}
        />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Which country is highlighted in <span className="text-amber font-semibold">amber</span>?
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {round.options.map((opt, i) => {
          const isAnswer = opt.id === round.correct.id;
          const isPickedOpt = picked === opt.id;
          const state =
            picked === null ? "idle" : isAnswer ? "correct" : isPickedOpt ? "wrong" : "muted";
          return (
            <ChoiceButton
              key={opt.id}
              label={opt.name}
              prefix={String.fromCharCode(65 + i)}
              onClick={() => handlePick(opt.id)}
              disabled={picked !== null}
              state={state}
            />
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
    </GameShell>
  );
}
