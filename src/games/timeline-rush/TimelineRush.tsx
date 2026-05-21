import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameShell, ResultsScreen } from "../shared/GameShell";
import { shuffle } from "../shared/gameUtils";
import {
  timelineQuestions,
  type TimelineAnswer,
  type TimelineDifficulty,
  type TimelineQuestion,
} from "./data";

type DifficultyMode = TimelineDifficulty | "mixed";

const ROUND_COUNT = 15;
const MODES: { label: string; value: DifficultyMode }[] = [
  { label: "Mixed", value: "mixed" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

function buildRounds(mode: DifficultyMode): TimelineQuestion[] {
  const pool =
    mode === "mixed" ? timelineQuestions : timelineQuestions.filter((q) => q.difficulty === mode);
  return shuffle(pool).slice(0, ROUND_COUNT);
}

function bonusForStreak(streak: number) {
  return streak > 0 && streak % 3 === 0 ? 1 : 0;
}

export default function TimelineRush() {
  const [mode, setMode] = useState<DifficultyMode>("mixed");
  const [rounds, setRounds] = useState<TimelineQuestion[]>(() => buildRounds("mixed"));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<TimelineAnswer | null>(null);

  const total = rounds.length;
  const round = rounds[index];
  const finished = index >= total;
  const isCorrect = picked !== null && picked === round?.correctAnswer;

  const startMode = (nextMode: DifficultyMode) => {
    setMode(nextMode);
    setRounds(buildRounds(nextMode));
    setIndex(0);
    setCorrectCount(0);
    setPoints(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
  };

  const handlePick = (answer: TimelineAnswer) => {
    if (picked || !round) return;
    setPicked(answer);

    if (answer === round.correctAnswer) {
      setCorrectCount((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        setPoints((p) => p + 1 + bonusForStreak(next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const stats = useMemo(
    () => [
      { label: "Score", value: `${correctCount} / ${total}` },
      { label: "Streak", value: streak, accent: streak >= 3 },
      { label: "Round", value: `${Math.min(index + 1, total)} of ${total}` },
      { label: "Points", value: points },
    ],
    [correctCount, total, streak, index, points],
  );

  if (finished) {
    return (
      <GameShell title="Timeline Rush" subtitle="Which happened first?">
        <div className="mx-auto max-w-2xl">
          <ResultsScreen
            score={correctCount}
            total={total}
            bestStreak={bestStreak}
            onRestart={() => startMode(mode)}
            unit="questions"
          />
          <div className="-mt-10 mb-12 text-center text-sm text-muted-foreground">
            Bonus-adjusted points: <span className="font-semibold text-foreground">{points}</span>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Timeline Rush" subtitle="Which happened first?" stats={stats}>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {MODES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={mode === item.value ? "default" : "outline"}
              onClick={() => startMode(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-4 shadow-xl shadow-black/25 backdrop-blur sm:p-6">
          <div
            aria-hidden
            className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber/50 to-transparent md:block"
          />
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">
              {round.era} / {round.region} / {round.difficulty}
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-4xl">Which happened first?</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
            <EventCard
              label="A"
              question={round}
              answer="A"
              picked={picked}
              onPick={() => handlePick("A")}
            />
            <div className="flex items-center justify-center">
              <div className="rounded-full border border-amber/50 bg-background px-4 py-2 text-sm font-black tracking-[0.25em] text-amber shadow-lg shadow-amber/10">
                VS
              </div>
            </div>
            <EventCard
              label="B"
              question={round}
              answer="B"
              picked={picked}
              onPick={() => handlePick("B")}
            />
          </div>

          <div className="mt-5 min-h-28 rounded-xl border border-border bg-background/45 p-4">
            {picked ? (
              <RevealPanel round={round} picked={picked} isCorrect={isCorrect} streak={streak} />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Pick the earlier event. Dates and context reveal after your answer.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex min-h-12 items-center justify-end">
          {picked && (
            <Button size="lg" onClick={handleNext}>
              {index + 1 === total ? "See results" : "Next ->"}
            </Button>
          )}
        </div>
      </div>
    </GameShell>
  );
}

interface EventCardProps {
  label: string;
  question: TimelineQuestion;
  answer: TimelineAnswer;
  picked: TimelineAnswer | null;
  onPick: () => void;
}

function EventCard({ label, question, answer, picked, onPick }: EventCardProps) {
  const event = answer === "A" ? question.eventA : question.eventB;
  const isAnswer = answer === question.correctAnswer;
  const isPicked = picked === answer;
  const state = picked === null ? "idle" : isAnswer ? "correct" : isPicked ? "wrong" : "muted";

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={picked !== null}
      className={cn(
        "group flex min-h-52 flex-col rounded-xl border border-border bg-card/80 p-5 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-amber/60 hover:shadow-xl hover:shadow-amber/10",
        "disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none",
        state === "correct" && "border-success/70 bg-success/15",
        state === "wrong" && "border-danger/70 bg-danger/15",
        state === "muted" && "opacity-55",
      )}
    >
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-amber/40 bg-background text-sm font-bold text-amber">
        {label}
      </span>
      <span className="text-xl font-bold leading-tight sm:text-2xl">{event.title}</span>
      {picked && (
        <span className="mt-auto pt-5 text-sm font-semibold text-muted-foreground">
          {event.displayDate}
        </span>
      )}
    </button>
  );
}

function RevealPanel({
  round,
  picked,
  isCorrect,
  streak,
}: {
  round: TimelineQuestion;
  picked: TimelineAnswer;
  isCorrect: boolean;
  streak: number;
}) {
  const correctEvent = round.correctAnswer === "A" ? round.eventA : round.eventB;
  const bonus = isCorrect ? bonusForStreak(streak) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-lg font-bold", isCorrect ? "text-success" : "text-danger")}>
          {isCorrect ? "Correct" : "Not quite"}: {correctEvent.title} came first.
        </p>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          You picked {picked}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <DateLine label="A" title={round.eventA.title} date={round.eventA.displayDate} />
        <DateLine label="B" title={round.eventB.title} date={round.eventB.displayDate} />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{round.explanation}</p>
      {bonus > 0 && (
        <p className="mt-2 text-sm font-semibold text-amber">Streak bonus: +{bonus} point</p>
      )}
    </div>
  );
}

function DateLine({ label, title, date }: { label: string; title: string; date: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
      <span className="mr-2 text-xs font-bold text-amber">{label}</span>
      <span className="font-medium">{date}</span>
      <span className="text-muted-foreground"> - {title}</span>
    </div>
  );
}
