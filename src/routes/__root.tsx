import { Outlet, Link, createRootRoute } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GeoPlaystation" },
      { name: "description", content: "Multiple Geography Games" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "GeoPlaystation" },
      { property: "og:description", content: "Multiple Geography Games" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "GeoPlaystation" },
      { name: "twitter:description", content: "Multiple Geography Games" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1c0baef3-f5cc-4a4f-807e-37b7d4e4fbcb/id-preview-a995b9f5--ec1d0be9-a771-4b8c-bc76-e9c4b91e6769.lovable.app-1777596593664.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1c0baef3-f5cc-4a4f-807e-37b7d4e4fbcb/id-preview-a995b9f5--ec1d0be9-a771-4b8c-bc76-e9c4b91e6769.lovable.app-1777596593664.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return <Outlet />;
}
