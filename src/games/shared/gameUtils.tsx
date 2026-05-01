import { cn } from "@/lib/utils";

interface ChoiceButtonProps {
  label: string;
  onClick: () => void;
  state: "idle" | "correct" | "wrong" | "muted";
  disabled?: boolean;
  prefix?: string;
}

export function ChoiceButton({ label, onClick, state, disabled, prefix }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card px-4 py-3.5 text-left text-base font-medium transition-all",
        "hover:border-amber/60 hover:bg-card/80 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber/5",
        "disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none",
        state === "correct" &&
          "border-success/70 bg-success text-success-foreground hover:bg-success",
        state === "wrong" &&
          "border-danger/70 bg-danger text-danger-foreground hover:bg-danger",
        state === "muted" && "opacity-50",
      )}
    >
      <span className="flex items-center gap-2">
        {prefix && (
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">
            {prefix}
          </span>
        )}
        <span>{label}</span>
      </span>
    </button>
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickDistractors<T extends { continent: string; id: string }>(
  pool: T[],
  correct: T,
  count: number,
): T[] {
  const sameContinent = pool.filter(
    (c) => c.continent === correct.continent && c.id !== correct.id,
  );
  const source =
    sameContinent.length >= count
      ? sameContinent
      : pool.filter((c) => c.id !== correct.id);
  return shuffle(source).slice(0, count);
}
