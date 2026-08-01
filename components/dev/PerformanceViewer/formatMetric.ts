export function formatMb(value: number | null, digits = 1) {
  if (value === null) return "—";
  return `${value.toFixed(digits)} MB`;
}

export function formatFpsClass(fps: number) {
  if (fps >= 55) return "text-emerald-400";
  if (fps >= 30) return "text-amber-300";
  return "text-rose-400";
}
