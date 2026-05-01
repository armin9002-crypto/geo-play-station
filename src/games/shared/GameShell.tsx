import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: ReactNode;
  accent?: boolean;
}

interface GameShellProps {
  title: string;
  subtitle?: string;
  stats?: StatItem[];
  children: ReactNode;
}

export function GameShell({ title, subtitle, stats, children }: GameShellProps) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, color-mix(in oklab, var(--amber) 18%, transparent) 0%, transparent 60%), radial-gradient(50% 40% at 0% 100%, color-mix(in oklab, var(--chart-4) 14%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-amber/40 hover:text-foreground"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              GeoGames
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: StatItem) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card/70 px-3 py-1.5 text-sm backdrop-blur",
        accent && "border-amber/50 text-amber shadow-[0_0_0_1px_color-mix(in_oklab,var(--amber)_25%,transparent)]",
      )}
    >
      <span className="mr-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

interface ResultsScreenProps {
  score: number;
  total: number;
  bestStreak: number;
  onRestart: () => void;
  unit?: string; // e.g. "questions"
}

export function ResultsScreen({
  score,
  total,
  bestStreak,
  onRestart,
  unit = "answers",
}: ResultsScreenProps) {
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const grade =
    accuracy >= 90 ? "Master geographer" :
    accuracy >= 75 ? "Globetrotter" :
    accuracy >= 50 ? "Apprentice cartographer" :
    "Keep exploring";
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber">
        {grade}
      </p>
      <h1 className="mt-3 text-5xl font-bold sm:text-6xl">
        <span
          className="bg-gradient-to-br from-amber to-foreground bg-clip-text text-transparent"
        >
          {score}
        </span>
        <span className="text-muted-foreground"> / {total}</span>
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {accuracy}% accuracy · best streak {bestStreak} · {total} {unit}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onRestart}
          className="rounded-md bg-amber px-6 py-2.5 text-sm font-semibold text-amber-foreground shadow-lg shadow-amber/20 transition-transform hover:-translate-y-0.5"
        >
          Play again
        </button>
        <Link
          to="/"
          className="rounded-md border border-border bg-card/70 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-amber/40"
        >
          Back to hub
        </Link>
      </div>
    </div>
  );
}
