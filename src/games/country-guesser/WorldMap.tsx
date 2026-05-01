import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
// world-atlas v2 ships TopoJSON files
// 110m is light & fast, perfect for quizzes
// @ts-expect-error - JSON import
import worldTopo from "world-atlas/countries-110m.json";

interface CountryProps {
  name: string;
}

let cachedFeatures: Feature<Geometry, CountryProps>[] | null = null;
function loadFeatures(): Feature<Geometry, CountryProps>[] {
  if (cachedFeatures) return cachedFeatures;
  const topo = worldTopo as any;
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<
    Geometry,
    CountryProps
  >;
  cachedFeatures = fc.features;
  return cachedFeatures;
}

interface WorldMapProps {
  highlightedId: string;
  revealedId?: string | null;
  revealStatus?: "correct" | "wrong" | null;
}

export default function WorldMap({ highlightedId, revealedId, revealStatus }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 960, h: 500 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setSize({ w, h: Math.max(280, w * 0.52) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const features = useMemo(() => loadFeatures(), []);

  const { pathFor, viewBox } = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([size.w, size.h], {
      type: "Sphere",
    } as any);
    const path = geoPath(projection);
    return { pathFor: path, viewBox: `0 0 ${size.w} ${size.h}` };
  }, [size.w, size.h]);

  const normalize = (id: string | number | undefined) =>
    String(id ?? "").padStart(3, "0");

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={viewBox}
        width="100%"
        height={size.h}
        role="img"
        aria-label="World map"
        className="block bg-ocean rounded-lg"
      >
        {/* ocean sphere */}
        <path
          d={pathFor({ type: "Sphere" } as any) ?? undefined}
          fill="var(--color-ocean)"
        />
        <g>
          {features.map((f) => {
            const id = normalize(f.id as string | number | undefined);
            let fill = "var(--color-land)";
            if (id === highlightedId) fill = "var(--color-amber)";
            if (revealedId && id === revealedId) {
              fill =
                revealStatus === "correct"
                  ? "var(--color-success)"
                  : "var(--color-success)";
            }
            if (revealStatus === "wrong" && id === highlightedId) {
              fill = "var(--color-danger)";
            }
            const d = pathFor(f as any);
            if (!d) return null;
            return (
              <path
                key={id + (f.properties?.name ?? "")}
                d={d}
                fill={fill}
                stroke="var(--color-land-stroke)"
                strokeWidth={0.4}
                style={{ transition: "fill 220ms ease" }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
