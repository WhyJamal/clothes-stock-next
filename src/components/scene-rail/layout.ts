export type RailLayout = {
  width: number;
  height: number;
  /** Distance between two neighbouring garments (px). */
  spacing: number;
  itemW: number;
  itemH: number;
  /** Number of rendered items (always a multiple of the product count). */
  count: number;
  /** Length of the looping strip (count * spacing). */
  total: number;
  /** How far the middle of the rail sags below its ends. */
  sag: number;
  /** Rail height at its left/right ends. */
  y0: number;
};

export const HOOK_DROP = 44; // px between the rail and the top of the garment
export const IMG_TOP = 40 / 1200; // garment top inside the 900x1200 canvas
export const MAX_HOVER_SCALE = 1.42;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = clamp((v - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const wrap = (v: number, min: number, max: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** `reserve` = px at the bottom kept free (the bar with the text, and room for the hovered garment to grow). */
export function computeLayout(width: number, height: number, n: number, reserve = 170): RailLayout {
  const spacingW = clamp(width / 7, 104, 220);
  const wantedH = (spacingW * 1.35 * 4) / 3;
  const maxH = Math.max(200, (height - reserve) / MAX_HOVER_SCALE);
  const itemH = Math.min(wantedH, maxH);
  const itemW = itemH * 0.75;
  const spacing = Math.min(spacingW, itemW / 1.35);
  const needed = Math.ceil(width / spacing) + 4;
  const count = n === 0 ? 0 : n * Math.ceil(needed / n);
  return {
    width,
    height,
    spacing,
    itemW,
    itemH,
    count,
    total: count * spacing,
    sag: width * 0.028,
    y0: 26,
  };
}

/** Horizontal centre of item `index` for a given scroll offset (looping). */
export const itemX = (index: number, scroll: number, l: RailLayout) =>
  wrap(index * l.spacing + scroll, -2 * l.spacing, l.total - 2 * l.spacing);

/** Height of the rail at horizontal position x. */
export const railY = (x: number, l: RailLayout) => {
  const t = x / l.width;
  return l.y0 + 4 * l.sag * t * (1 - t);
};

/** SVG path of the rail, sampled from the same formula the hooks use. */
export function railPath(l: RailLayout) {
  const pad = 60;
  const steps = 48;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = -pad + ((l.width + pad * 2) * i) / steps;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${railY(x, l).toFixed(1)} `;
  }
  return d;
}
