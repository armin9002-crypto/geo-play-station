import { createFileRoute, Link } from "@tanstack/react-router";
import { games } from "@/games/registry";
import { countries } from "@/games/shared/countryData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoGames — Test your geography knowledge" },
      {
        name: "description",
        content:
          "A growing collection of geography games. Identify countries, capitals, flags, borders, and more.",
      },
      { property: "og:title", content: "GeoGames" },
      {
        property: "og:description",
        content: "A growing collection of geography games.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const available = games.filter((g) => g.status === "available").length;
  const continents = new Set(countries.map((c) => c.continent)).size;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background grid + glow */}
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
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="text-2xl">🌐</span>
          <span>GeoGames</span>
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

      <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 text-center sm:pt-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
          {available} games live
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Sharpen your sense of{" "}
          <span className="bg-gradient-to-br from-amber via-amber to-foreground bg-clip-text text-transparent">
            the world
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
          Bite-sized geography games. Identify countries, recall capitals,
          recognize flags, and master borders — all in one place.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <Pill label={`${countries.length} countries`} />
          <Pill label={`${continents} continents`} />
          <Pill label="Dark cartographic UI" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">Choose a game</h2>
          <span className="text-xs text-muted-foreground">
            More coming soon
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => {
            const isAvailable = g.status === "available";
            const card = (
              <div
                className={cn(
                  "group relative h-full overflow-hidden rounded-2xl border border-border bg-card/70 p-6 backdrop-blur transition-all duration-300",
                  isAvailable
                    ? "hover:-translate-y-1 hover:border-transparent hover:shadow-2xl"
                    : "opacity-60",
                )}
                style={
                  isAvailable
                    ? ({
                        // Each card gets its own glow color via CSS var
                        "--card-accent": g.accent,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                {/* Accent ring on hover */}
                {isAvailable && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      boxShadow:
                        "0 0 0 1px color-mix(in oklab, var(--card-accent) 60%, transparent), 0 24px 48px -16px color-mix(in oklab, var(--card-accent) 30%, transparent)",
                    }}
                  />
                )}
                {/* Accent glow background */}
                {isAvailable && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
                    style={{ background: "var(--card-accent)" }}
                  />
                )}

                <div className="relative mb-5 flex items-start justify-between">
                  <span className="text-5xl drop-shadow-lg">{g.icon}</span>
                  {isAvailable ? (
                    <span
                      className="rounded-full border border-border/80 bg-background/40 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                    >
                      {g.difficulty}
                    </span>
                  ) : (
                    <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {g.tagline}
                </p>
                <h3 className="relative mt-1 text-xl font-semibold">{g.name}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  {g.description}
                </p>
                {isAvailable && (
                  <div className="relative mt-6 inline-flex items-center text-sm font-medium text-foreground">
                    Play now
                    <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                )}
              </div>
            );

            return isAvailable ? (
              <Link
                key={g.slug}
                to="/games/$slug"
                params={{ slug: g.slug }}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-2xl"
              >
                {card}
              </Link>
            ) : (
              <div key={g.slug} aria-disabled className="cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with curiosity · Data: Natural Earth, CIA World Factbook
      </footer>
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
