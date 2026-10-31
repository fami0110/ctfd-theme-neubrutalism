const SERIES_TONE_TOKENS = [
  "--ctfd-chart-tone-1",
  "--ctfd-chart-tone-2",
  "--ctfd-chart-tone-3",
  "--ctfd-chart-tone-4",
  "--ctfd-chart-tone-5",
  "--ctfd-chart-tone-6",
];

const SERIES_TONE_FALLBACKS = [
  "#1565fe",
  "#b7b000",
  "#0d47a1",
  "#fef91b",
  "#4b86ff",
  "#8d8800",
];

function getRootStyles() {
  return getComputedStyle(document.documentElement);
}

export function getThemeColor(token, fallback) {
  return getRootStyles().getPropertyValue(token).trim() || fallback;
}

export function getThemeSeriesPalette() {
  return SERIES_TONE_TOKENS.map((token, index) => {
    return getThemeColor(token, SERIES_TONE_FALLBACKS[index]);
  });
}

export function getThemeSeriesColor(index) {
  const palette = getThemeSeriesPalette();
  return palette[index % palette.length];
}

export function getThemeStatColors() {
  return {
    solve: getThemeColor("--ctfd-success", "#1565fe"),
    fail: getThemeColor("--ctfd-danger", "#0d47a1"),
  };
}

export function getThemeChartColors() {
  return {
    text: getThemeColor("--ctfd-chart-text", "#111111"),
    textSoft: getThemeColor("--ctfd-chart-text", "#111111"),
    textMuted: getThemeColor(
      "--ctfd-chart-text-muted",
      "rgba(17, 17, 17, 0.7)",
    ),
    surfaceHigh: getThemeColor("--ctfd-chart-surface", "#ffffff"),
    surfaceBright: getThemeColor("--ctfd-chart-surface", "#ffffff"),
    outline: getThemeColor("--ctfd-chart-outline", "rgba(17, 17, 17, 0.24)"),
    grid: getThemeColor("--ctfd-chart-grid", "rgba(17, 17, 17, 0.14)"),
    primary: getThemeColor("--ctfd-primary", "#fef91b"),
    fontBody: getThemeColor(
      "--ctfd-font-body",
      '"Manrope", "Lato", sans-serif',
    ),
  };
}
