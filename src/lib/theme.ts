/**
 * Theme presets and accent derivation.
 *
 * Every colour on the site is already a custom property declared once in
 * globals.css, so theming is a matter of overriding a handful of those in a
 * <style> tag rather than touching any component.
 *
 * Client-safe: the dashboard preview and the public site both import this.
 */

/** The tokens a preset is allowed to override. Anything not listed keeps the
 *  value in globals.css, which is what stops a preset half-restyling the site. */
export type ThemeTokens = {
  ink: string;
  inkDeep: string;
  inkLine: string;
  inkBorder: string;
  inkHover: string;
  paper: string;
  paperAlt: string;
  line: string;
  lineWarm: string;
  accent: string;
  accentLight: string;
  accentDeep: string;
};

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Field",
    description: "The original: deep green with an ochre accent.",
    tokens: {
      ink: "#0f1d18",
      inkDeep: "#0b1613",
      inkLine: "#22342c",
      inkBorder: "#3a4b44",
      inkHover: "#1b3229",
      paper: "#f5f2ec",
      paperAlt: "#efebe1",
      line: "#ded7c9",
      lineWarm: "#e4ded1",
      accent: "#b07c2e",
      accentLight: "#c9a063",
      accentDeep: "#8c5e1a",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Near-black blue with a brass accent. Colder, more formal.",
    tokens: {
      ink: "#11161f",
      inkDeep: "#0b0f16",
      inkLine: "#232c3a",
      inkBorder: "#3b4759",
      inkHover: "#1c2533",
      paper: "#f3f4f6",
      paperAlt: "#e9ebef",
      line: "#d4d8df",
      lineWarm: "#dcdfe5",
      accent: "#a8842f",
      accentLight: "#c4a45f",
      accentDeep: "#7e6019",
    },
  },
  {
    id: "clay",
    name: "Clay",
    description: "Warm brown ground with terracotta. Earthier, softer.",
    tokens: {
      ink: "#1f1712",
      inkDeep: "#17110d",
      inkLine: "#342a22",
      inkBorder: "#4d4136",
      inkHover: "#2c221b",
      paper: "#f7f2eb",
      paperAlt: "#f0e9df",
      line: "#e0d5c6",
      lineWarm: "#e7dccd",
      accent: "#b05f2e",
      accentLight: "#cc8a5e",
      accentDeep: "#8a4519",
    },
  },
  {
    id: "harbour",
    name: "Harbour",
    description: "Slate blue-grey with a muted teal. Quiet and industrial.",
    tokens: {
      ink: "#14201f",
      inkDeep: "#0e1817",
      inkLine: "#253634",
      inkBorder: "#3d514e",
      inkHover: "#1d2e2c",
      paper: "#f2f4f3",
      paperAlt: "#e8ecea",
      line: "#d3dad8",
      lineWarm: "#dae0de",
      accent: "#2f7d72",
      accentLight: "#5ba59a",
      accentDeep: "#1d5d54",
    },
  },
];

export const DEFAULT_PRESET = THEME_PRESETS[0];

export function presetById(id: string | null | undefined): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? DEFAULT_PRESET;
}

/* -------------------------------------------------------------------------- */
/* Colour maths                                                                */
/* -------------------------------------------------------------------------- */

type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return "#" + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("");
}

/** Mixes toward white (amount > 0) or black (amount < 0), -1 to 1. */
function shift(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const target = amount > 0 ? 255 : 0;
  const weight = Math.abs(amount);

  return rgbToHex({
    r: rgb.r + (target - rgb.r) * weight,
    g: rgb.g + (target - rgb.g) * weight,
    b: rgb.b + (target - rgb.b) * weight,
  });
}

/** Relative luminance, per WCAG 2.1. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** Contrast ratio between two hex colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Builds the light and deep variants from a chosen accent.
 *
 * `accentDeep` is used as link and eyebrow text on the paper ground, so it is
 * darkened until it clears 4.5:1 against that ground rather than being a fixed
 * step — a mid-yellow needs far more darkening than a mid-blue to stay legible.
 */
export function deriveAccent(accent: string, paper: string) {
  const light = shift(accent, 0.28);

  let deep = shift(accent, -0.2);
  for (let step = 0; step < 12 && contrastRatio(deep, paper) < 4.5; step++) {
    deep = shift(deep, -0.1);
  }

  return { accent, accentLight: light, accentDeep: deep };
}

/**
 * Whether the accent works as a button fill with ink-coloured text on it.
 * Surfaced as a warning in the dashboard rather than enforced, so the owner can
 * still choose a brand colour and decide for themselves.
 */
export function accentIsLegible(accent: string, ink: string): boolean {
  return contrastRatio(accent, ink) >= 4.5;
}

/* -------------------------------------------------------------------------- */
/* CSS                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The custom-property overrides for a theme, as CSS text.
 *
 * Only ever emits colours that have been through hexToRgb, so nothing
 * user-supplied reaches a stylesheet unvalidated.
 */
export function themeCss(presetId: string | null, accentOverride: string | null): string {
  const preset = presetById(presetId);
  const tokens = { ...preset.tokens };

  if (accentOverride && hexToRgb(accentOverride)) {
    const derived = deriveAccent(accentOverride, tokens.paper);
    tokens.accent = derived.accent;
    tokens.accentLight = derived.accentLight;
    tokens.accentDeep = derived.accentDeep;
  }

  const safe = (value: string) => {
    const rgb = hexToRgb(value);
    return rgb ? rgbToHex(rgb) : "#000000";
  };

  return `:root{--ink:${safe(tokens.ink)};--ink-deep:${safe(tokens.inkDeep)};--ink-line:${safe(
    tokens.inkLine,
  )};--ink-border:${safe(tokens.inkBorder)};--ink-hover:${safe(
    tokens.inkHover,
  )};--paper:${safe(tokens.paper)};--paper-alt:${safe(tokens.paperAlt)};--line:${safe(
    tokens.line,
  )};--line-warm:${safe(tokens.lineWarm)};--accent:${safe(
    tokens.accent,
  )};--accent-light:${safe(tokens.accentLight)};--accent-deep:${safe(
    tokens.accentDeep,
  )};--text:${safe(tokens.ink)};}`;
}
