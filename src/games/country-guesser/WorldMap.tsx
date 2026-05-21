import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  getCountryZoomTransform,
  interpolateZoomTransform,
  WORLD_ZOOM_TRANSFORM,
  type MapZoomTransform,
} from "../shared/mapZoom";
// world-atlas v2 ships TopoJSON files
// 50m keeps the map fast while preserving tiny countries used in quiz rounds.
import worldTopo from "world-atlas/countries-50m.json";

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
  viewMode?: "target" | "world";
}

export default function WorldMap({
  highlightedId,
  revealedId,
  revealStatus,
  viewMode = "target",
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 960, h: 500 });
  const [displayTransform, setDisplayTransform] = useState<MapZoomTransform>(WORLD_ZOOM_TRANSFORM);
  const transformRef = useRef(WORLD_ZOOM_TRANSFORM);

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

  const { pathFor, viewBox, targetTransform } = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([size.w, size.h], {
      type: "Sphere",
    } as any);
    const path = geoPath(projection);
    const target = features.find(
      (f) => normalize(f.id as string | number | undefined) === highlightedId,
    );
    const targetTransform = target
      ? getCountryZoomTransform(path.bounds(target as any), size)
      : WORLD_ZOOM_TRANSFORM;
    return { pathFor: path, viewBox: `0 0 ${size.w} ${size.h}`, targetTransform };
  }, [features, highlightedId, size]);

  useEffect(() => {
    const from = transformRef.current;
    const to = viewMode === "world" ? WORLD_ZOOM_TRANSFORM : targetTransform;
    const duration = 720;
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = interpolateZoomTransform(from, to, progress);
      transformRef.current = next;
      setDisplayTransform(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetTransform, viewMode]);

  const mapTransform = `translate(${displayTransform.x} ${displayTransform.y}) scale(${displayTransform.k})`;
  const normalizedStroke = 0.4 / displayTransform.k;

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
        <path d={pathFor({ type: "Sphere" } as any) ?? undefined} fill="var(--color-ocean)" />
        <g transform={mapTransform}>
          {features.map((f) => {
            const id = normalize(f.id as string | number | undefined);
            let fill = "var(--color-land)";
            if (id === highlightedId) {
              // Always show the correct country: amber while guessing,
              // green once revealed (regardless of whether the user was right).
              fill = revealStatus ? "var(--color-success)" : "var(--color-amber)";
            }
            const d = pathFor(f as any);
            if (!d) return null;
            return (
              <path
                key={id + (f.properties?.name ?? "")}
                d={d}
                fill={fill}
                stroke="var(--color-land-stroke)"
                strokeWidth={normalizedStroke}
                style={{ transition: "fill 220ms ease" }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function normalize(id: string | number | undefined) {
  return String(id ?? "").padStart(3, "0");
}
