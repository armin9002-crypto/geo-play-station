import { createFileRoute, Link } from "@tanstack/react-router";
import { games } from "@/games/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoGames — Test your geography knowledge" },
      {
        name: "description",
        content:
          "A growing collection of geography games. Identify countries, capitals, flags, and more.",
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
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--amber) 0, transparent 40%), radial-gradient(circle at 80% 60%, var(--amber) 0, transparent 35%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            GeoGames
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Test your geography knowledge
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            A growing collection of bite-sized games to sharpen your sense of
            the world. Pick a game and start playing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Games</h2>
          <span className="text-sm text-muted-foreground">
            {games.filter((g) => g.status === "available").length} available ·{" "}
            {games.filter((g) => g.status === "coming-soon").length} in
            progress
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => {
            const isAvailable = g.status === "available";
            const card = (
              <div
                className={cn(
                  "group relative h-full rounded-xl border border-border bg-card p-6 transition-all",
                  isAvailable
                    ? "hover:-translate-y-0.5 hover:border-amber/60 hover:shadow-lg hover:shadow-amber/5"
                    : "opacity-60",
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{g.icon}</span>
                  {!isAvailable && (
                    <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{g.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {g.description}
                </p>
                {isAvailable && (
                  <div className="mt-5 inline-flex items-center text-sm font-medium text-amber">
                    Play now
                    <span className="ml-1 transition-transform group-hover:translate-x-0.5">
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
                className="block"
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
        Made with curiosity · maps © Natural Earth
      </footer>
    </div>
  );
}
