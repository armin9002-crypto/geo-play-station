export interface MapSize {
  w: number;
  h: number;
}

export interface MapZoomTransform {
  k: number;
  x: number;
  y: number;
}

export type ProjectedBounds = [[number, number], [number, number]];

export const WORLD_ZOOM_TRANSFORM: MapZoomTransform = { k: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getCountryZoomTransform(bounds: ProjectedBounds, size: MapSize): MapZoomTransform {
  const [[x0, y0], [x1, y1]] = bounds;
  const dx = Math.max(1, x1 - x0);
  const dy = Math.max(1, y1 - y0);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const minDimension = Math.min(dx, dy);
  const padding = Math.max(32, Math.min(size.w, size.h) * 0.16);
  const fitZoom = Math.min(size.w / (dx + padding * 2), size.h / (dy + padding * 2));
  const readableZoom = 58 / minDimension;
  const adaptiveMaxZoom =
    minDimension > 90
      ? 1.45
      : minDimension > 45
        ? 2.25
        : minDimension > 24
          ? 4
          : minDimension > 10
            ? 7
            : 14;
  const k = clamp(Math.max(fitZoom, readableZoom, 1.08), 1, adaptiveMaxZoom);

  return {
    k,
    x: size.w / 2 - cx * k,
    y: size.h / 2 - cy * k,
  };
}

export function interpolateZoomTransform(
  from: MapZoomTransform,
  to: MapZoomTransform,
  t: number,
): MapZoomTransform {
  const eased = 1 - Math.pow(1 - t, 3);
  return {
    k: from.k + (to.k - from.k) * eased,
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
  };
}
