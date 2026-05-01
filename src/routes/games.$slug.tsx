import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getGame } from "@/games/registry";

export const Route = createFileRoute("/games/$slug")({
  head: ({ params }) => {
    const game = getGame(params.slug);
    const title = game ? `${game.name} — GeoGames` : "Game — GeoGames";
    const description = game?.description ?? "Geography game on GeoGames.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const game = getGame(params.slug);
    if (!game || game.status !== "available" || !game.component) {
      throw notFound();
    }
    return { slug: params.slug };
  },
  component: GamePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Game not found</h1>
        <p className="mt-2 text-muted-foreground">
          This game isn't available yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to hub
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to hub
        </Link>
      </div>
    </div>
  ),
});

function GamePage() {
  const { slug } = Route.useLoaderData();
  const game = getGame(slug);
  if (!game?.component) return null;
  const Component = game.component;
  return <Component />;
}
