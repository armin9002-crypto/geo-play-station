import { createFileRoute, Link } from "@tanstack/react-router";
import { games, type GameCategory, type GameEntry } from "@/games/registry";
import { countries } from "@/games/shared/countryData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "World Knowledge Arcade" },
      {
        name: "description",
        content:
          "Play polished geography, history, flag, and capital games in one world knowledge arcade.",
      },
      { property: "og:title", content: "World Knowledge Arcade" },
      {
        property: "og:description",
        content: "A growing collection of map, history, flag, and capital challenges.",
      },
    ],
  }),
  component: Home,
});

const categoryOrder: GameCategory[] = ["Geography", "History", "Flags & Capitals"];

const categoryDetails: Record<GameCategory, { description: string; accent: string }> = {
  Geography: {
    description: "Map instincts, borders, countries, and spatial memory.",
    accent: "var(--amber)",
  },
  History: {
    description: "Empires, timelines, eras, and the shape of world events.",
    accent: "oklch(0.72 0.16 110)",
  },
  "Flags & Capitals": {
    description: "Fast recall for symbols, capitals, and country identity.",
    accent: "oklch(0.7 0.15 200)",
  },
};

function Home() {
  const available = games.filter((g) => g.status === "available").length;
  const continents = new Set(countries.map((c) => c.continent)).size;
  const gamesByCategory = categoryOrder.map((category) => ({
    category,
    games: games.filter((g) => g.category === category),
  }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, color-mix(in oklab, var(--amber) 18%, transparent) 0%, transparent 60%), radial-gradient(50% 40% at 0% 100%, color-mix(in oklab, var(--chart-4) 18%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="text-2xl">🌐</span>
          <span>World Knowledge Arcade</span>
        </div>
        <a
          href="https://www.naturalearthdata.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Maps © Natural Earth
        </a>
      </header>

      <section className="relative mx-auto max-w-5xl px-4 pb-12 pt-8 text-center sm:pt-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
          {available} games live
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          World Knowledge{" "}
          <span className="bg-gradient-to-br from-amber via-amber to-foreground bg-clip-text text-transparent">
            Arcade
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
          A polished set of bite-sized games for maps, flags, capitals, borders, empires, and world
          history.
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <Pill label={`${countries.length} countries`} />
          <Pill label={`${continents} continents`} />
          <Pill label="Geography + history" />
          <Pill label="Fast arcade rounds" />
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
              Choose your challenge
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Play by category</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground sm:text-right">
            Each game keeps its own rules and score loop, but the hub now treats them as one arcade.
          </p>
        </div>

        {gamesByCategory.map(({ category, games }) => (
          <CategorySection key={category} category={category} games={games} />
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with curiosity · Data: Natural Earth, CIA World Factbook
      </footer>
    </div>
  );
}

function CategorySection({ category, games }: { category: GameCategory; games: GameEntry[] }) {
  const details = categoryDetails[category];

  return (
    <section
      className="space-y-4"
      style={
        {
          "--section-accent": details.accent,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[var(--section-accent)] shadow-[0_0_24px_var(--section-accent)]" />
            <h3 className="text-xl font-semibold sm:text-2xl">{category}</h3>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{details.description}</p>
        </div>
        <span className="w-fit rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          {games.length} {games.length === 1 ? "game" : "games"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: GameEntry }) {
  const isAvailable = game.status === "available";
  const card = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-border bg-card/70 p-5 backdrop-blur transition-all duration-300 sm:p-6",
        isAvailable
          ? "hover:-translate-y-1 hover:border-transparent hover:shadow-2xl"
          : "opacity-60",
      )}
      style={
        isAvailable
          ? ({
              "--card-accent": game.accent,
            } as React.CSSProperties)
          : undefined
      }
    >
      {isAvailable && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              boxShadow:
                "0 0 0 1px color-mix(in oklab, var(--card-accent) 60%, transparent), 0 24px 48px -16px color-mix(in oklab, var(--card-accent) 30%, transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
            style={{ background: "var(--card-accent)" }}
          />
        </>
      )}

      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <span className="text-5xl drop-shadow-lg">{game.icon}</span>
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              borderColor:
                "color-mix(in oklab, var(--card-accent, var(--border)) 50%, transparent)",
              background: "color-mix(in oklab, var(--card-accent, var(--card)) 12%, transparent)",
              color: "var(--foreground)",
            }}
          >
            {game.category}
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {game.tagline}
          </p>
          <h4 className="mt-1 text-2xl font-semibold">{game.name}</h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{game.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <MetaChip label={game.difficulty} />
          <MetaChip label={game.roundLength} />
        </div>

        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <span className="text-xs text-muted-foreground">
            {isAvailable ? "Ready to play" : "Coming soon"}
          </span>
          {isAvailable && (
            <span className="inline-flex items-center text-sm font-medium text-foreground">
              Play now
              <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return isAvailable ? (
    <Link
      to="/games/$slug"
      params={{ slug: game.slug }}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
    >
      {card}
    </Link>
  ) : (
    <div aria-disabled className="cursor-not-allowed">
      {card}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-card/60 px-3 py-1 backdrop-blur">
      {label}
    </span>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background/35 px-2.5 py-1 backdrop-blur">
      {label}
    </span>
  );
}
