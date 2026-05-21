import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects, type GeoSphere } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryObject, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import {
  fitBoundsToViewport,
  interpolateZoomTransform,
  WORLD_ZOOM_TRANSFORM,
  type MapZoomTransform,
  type ProjectedBounds,
} from "../shared/mapZoom";

interface CountryProps {
  name: string;
}

type RevealState = "correct" | "missed" | "wrong" | "neutral";

interface EmpireMapProps {
  selectedIds: Set<string>;
  correctIds: Set<string>;
  revealed: boolean;
  focusIds: string[];
  viewMode: "focus" | "world";
  onToggleCountry: (id: string) => void;
}

let cachedFeatures: Feature<Geometry, CountryProps>[] | null = null;

function loadFeatures(): Feature<Geometry, CountryProps>[] {
  if (cachedFeatures) return cachedFeatures;
  const topo = worldTopo as unknown as Topology<{ countries: GeometryObject<CountryProps> }>;
  const fc = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, CountryProps>;
  cachedFeatures = fc.features;
  return cachedFeatures;
}

export default function EmpireMap({
  selectedIds,
  correctIds,
  revealed,
  focusIds,
  viewMode,
  onToggleCountry,
}: EmpireMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 960, h: 520 });
  const [displayTransform, setDisplayTransform] = useState<MapZoomTransform>(WORLD_ZOOM_TRANSFORM);
  const transformRef = useRef(WORLD_ZOOM_TRANSFORM);
  const features = useMemo(() => loadFeatures(), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setSize({ w, h: Math.max(300, w * 0.54) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { pathFor, viewBox, focusTransform } = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([size.w, size.h], {
      type: "Sphere",
    } satisfies GeoSphere);
    const path = geoPath(projection);
    const focusSet = new Set(focusIds);
    const bounds = mergeBounds(
      features
        .filter((f) => focusSet.has(normalize(f.id as string | number | undefined)))
        .map((f) => path.bounds(f as GeoPermissibleObjects)),
    );
    const focusTransform = bounds
      ? fitBoundsToViewport(bounds, size, { maxZoom: 3.2, minZoom: 1.02, paddingRatio: 0.18 })
      : WORLD_ZOOM_TRANSFORM;

    return { pathFor: path, viewBox: `0 0 ${size.w} ${size.h}`, focusTransform };
  }, [features, focusIds, size]);

  useEffect(() => {
    const from = transformRef.current;
    const to = viewMode === "world" ? WORLD_ZOOM_TRANSFORM : focusTransform;
    const duration = 720;
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = interpolateZoomTransform(from, to, progress);
      transformRef.current = next;
      setDisplayTransform(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [focusTransform, viewMode]);

  const mapTransform = `translate(${displayTransform.x} ${displayTransform.y}) scale(${displayTransform.k})`;
  const normalizedStroke = 0.45 / displayTransform.k;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={viewBox}
        width="100%"
        height={size.h}
        role="img"
        aria-label="Selectable world map"
        className="block rounded-lg bg-ocean"
      >
        <path
          d={pathFor({ type: "Sphere" } satisfies GeoSphere) ?? undefined}
          fill="var(--color-ocean)"
        />
        <g transform={mapTransform}>
          {features.map((f) => {
            const id = normalize(f.id as string | number | undefined);
            const d = pathFor(f as GeoPermissibleObjects);
            if (!d) return null;
            const state = getRevealState(id, selectedIds, correctIds, revealed);
            return (
              <path
                key={id + (f.properties?.name ?? "")}
                d={d}
                fill={fillForState(state, selectedIds.has(id), revealed)}
                stroke={strokeForState(state)}
                strokeWidth={state === "neutral" ? normalizedStroke : normalizedStroke * 1.8}
                onClick={() => {
                  if (!revealed) onToggleCountry(id);
                }}
                className={!revealed ? "cursor-pointer transition-colors hover:brightness-125" : ""}
              >
                <title>{f.properties?.name ?? id}</title>
              </path>
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

function mergeBounds(bounds: ProjectedBounds[]): ProjectedBounds | null {
  if (!bounds.length) return null;
  return bounds.reduce<ProjectedBounds>(
    (acc, next) => [
      [Math.min(acc[0][0], next[0][0]), Math.min(acc[0][1], next[0][1])],
      [Math.max(acc[1][0], next[1][0]), Math.max(acc[1][1], next[1][1])],
    ],
    bounds[0],
  );
}

function getRevealState(
  id: string,
  selectedIds: Set<string>,
  correctIds: Set<string>,
  revealed: boolean,
): RevealState {
  if (!revealed) return "neutral";
  if (selectedIds.has(id) && correctIds.has(id)) return "correct";
  if (selectedIds.has(id) && !correctIds.has(id)) return "wrong";
  if (!selectedIds.has(id) && correctIds.has(id)) return "missed";
  return "neutral";
}

function fillForState(state: RevealState, selected: boolean, revealed: boolean) {
  if (!revealed && selected) return "var(--color-amber)";
  if (state === "correct") return "var(--color-success)";
  if (state === "wrong") return "var(--color-danger)";
  if (state === "missed") return "var(--color-amber)";
  return "var(--color-land)";
}

function strokeForState(state: RevealState) {
  if (state === "correct") return "color-mix(in oklab, var(--color-success) 70%, white)";
  if (state === "wrong") return "color-mix(in oklab, var(--color-danger) 70%, white)";
  if (state === "missed") return "color-mix(in oklab, var(--color-amber) 70%, white)";
  return "var(--color-land-stroke)";
}
