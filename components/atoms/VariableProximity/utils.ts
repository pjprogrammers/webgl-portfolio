import type { ParsedFontAxis, VariableProximityFalloff } from "./types";

export const parseFontVariationSettings = (
  settingsStr: string,
): Map<string, number> =>
  new Map(
    settingsStr
      .split(",")
      .map((segment) => segment.trim())
      .map((segment) => {
        const [name, value] = segment.split(" ");
        return [name.replace(/['"]/g, ""), parseFloat(value)];
      }),
  );

export const buildParsedSettings = (
  fromFontVariationSettings: string,
  toFontVariationSettings: string,
): ParsedFontAxis[] => {
  const fromSettings = parseFontVariationSettings(fromFontVariationSettings);
  const toSettings = parseFontVariationSettings(toFontVariationSettings);

  return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
    axis,
    fromValue,
    toValue: toSettings.get(axis) ?? fromValue,
  }));
};

export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => Math.hypot(x2 - x1, y2 - y1);

export const calculateFalloff = (
  distance: number,
  radius: number,
  falloff: VariableProximityFalloff,
) => {
  const norm = Math.min(Math.max(1 - distance / radius, 0), 1);

  switch (falloff) {
    case "exponential":
      return norm ** 2;
    case "gaussian":
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    case "linear":
    default:
      return norm;
  }
};

export const interpolateFontVariationSettings = (
  parsedSettings: ParsedFontAxis[],
  falloffValue: number,
) =>
  parsedSettings
    .map(({ axis, fromValue, toValue }) => {
      const interpolatedValue =
        fromValue + (toValue - fromValue) * falloffValue;
      return `'${axis}' ${interpolatedValue}`;
    })
    .join(", ");
