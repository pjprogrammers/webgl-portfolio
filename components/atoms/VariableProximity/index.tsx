"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from "react";
import classnames from "classnames";
import { redHatDisplayVariable } from "./font";
import { useAnimationFrame, useMousePositionRef } from "./hooks";
import type { VariableProximityProps } from "./types";
import {
  buildParsedSettings,
  calculateDistance,
  calculateFalloff,
  interpolateFontVariationSettings,
} from "./utils";

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>(
  (
    {
      label,
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = "linear",
      className = "",
      onClick,
      style,
      ...restProps
    },
    ref,
  ) => {
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const interpolatedSettingsRef = useRef<string[]>([]);
    const mousePositionRef = useMousePositionRef(containerRef);
    const lastPositionRef = useRef<{ x: number | null; y: number | null }>({
      x: null,
      y: null,
    });

    const parsedSettings = useMemo(
      () =>
        buildParsedSettings(
          fromFontVariationSettings,
          toFontVariationSettings,
        ),
      [fromFontVariationSettings, toFontVariationSettings],
    );

    const updateLetters = useCallback(() => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const { x, y } = mousePositionRef.current;

      if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
        return;
      }

      lastPositionRef.current = { x, y };

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

        const distance = calculateDistance(x, y, letterCenterX, letterCenterY);

        if (distance >= radius) {
          letterRef.style.fontVariationSettings = fromFontVariationSettings;
          return;
        }

        const falloffValue = calculateFalloff(distance, radius, falloff);
        const newSettings = interpolateFontVariationSettings(
          parsedSettings,
          falloffValue,
        );

        interpolatedSettingsRef.current[index] = newSettings;
        letterRef.style.fontVariationSettings = newSettings;
      });
    }, [
      containerRef,
      falloff,
      fromFontVariationSettings,
      mousePositionRef,
      parsedSettings,
      radius,
    ]);

    useAnimationFrame(updateLetters);

    const words = label.split(" ");
    let letterIndex = 0;

    return (
      <span
        ref={ref}
        className={classnames(redHatDisplayVariable.className, className)}
        onClick={onClick}
        style={{ display: "inline", ...style }}
        {...restProps}
      >
        {words.map((word, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
          >
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++;

              return (
                <span
                  key={currentLetterIndex}
                  ref={(element) => {
                    letterRefs.current[currentLetterIndex] = element;
                  }}
                  data-vp-char=""
                  style={{
                    display: "inline-block",
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                  aria-hidden="true"
                >
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 && (
              <span style={{ display: "inline-block" }}>&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  },
);

VariableProximity.displayName = "VariableProximity";

export default VariableProximity;
export type { VariableProximityProps };
