import type { CSSProperties, HTMLAttributes, RefObject } from "react";

export type VariableProximityFalloff = "linear" | "exponential" | "gaussian";

export type VariableProximityProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: VariableProximityFalloff;
  onClick?: () => void;
  style?: CSSProperties;
};

export type ParsedFontAxis = {
  axis: string;
  fromValue: number;
  toValue: number;
};
