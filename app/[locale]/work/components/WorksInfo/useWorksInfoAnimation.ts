"use client";

import { useEffect, useRef, type RefObject } from "react";

import { gsap, SplitText } from "@/lib/gsap/registerPlugin";
import { useGlobalStore } from "@/stores/global-store";

import {
  WORK_INFO_SCRUB_EASE,
  WORK_LINE_ENTER,
  WORK_LINE_EXIT,
  WORK_LINE_FROM,
  WORK_NAME_CHAR_ENTER,
  WORK_NAME_CHAR_EXIT,
  WORK_NAME_CHAR_FROM,
} from "./worksInfoAnimation";

type WorksInfoAnimationRefs = {
  containerRef: RefObject<HTMLElement | null>;
  nameRef: RefObject<HTMLElement | null>;
};

type SplitState = {
  nameSplit: SplitText | null;
  lineSplits: SplitText[];
  lineElements: Element[];
  nameChars: Element[];
};

function splitLines(el: HTMLElement) {
  return new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });
}

function splitName(el: HTMLElement) {
  return new SplitText(el, {
    type: "chars,words,lines",
    tag: "span",
  });
}

function collectLineElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>("[data-work-line]"),
  );
}

function buildSplitState(
  container: HTMLElement,
  nameEl: HTMLElement,
): SplitState {
  const nameSplit = splitName(nameEl);
  const lineSplits: SplitText[] = [];
  const lineElements: Element[] = [];

  collectLineElements(container).forEach((el) => {
    const split = splitLines(el);
    lineSplits.push(split);
    lineElements.push(...split.lines);
  });

  return {
    nameSplit,
    lineSplits,
    lineElements,
    nameChars: nameSplit.chars,
  };
}

function revertSplitState(state: SplitState | null) {
  if (!state) return;
  state.lineSplits.forEach((split) => split.revert());
  state.nameSplit?.revert();
}

function setHiddenState(state: SplitState) {
  gsap.set(state.lineElements, WORK_LINE_FROM);
  gsap.set(state.nameChars, WORK_NAME_CHAR_FROM);
}

function setVisibleState(state: SplitState) {
  gsap.set(state.lineElements, {
    yPercent: 0,
    scale: 1,
    rotate: 0,
  });
  gsap.set(state.nameChars, { opacity: 1 });
}

function buildEnterTimeline(state: SplitState) {
  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } });

  tl.fromTo(state.nameChars, WORK_NAME_CHAR_FROM, WORK_NAME_CHAR_ENTER, 0);
  tl.fromTo(state.lineElements, WORK_LINE_FROM, WORK_LINE_ENTER, 0);

  return tl;
}

function buildExitTimeline(state: SplitState) {
  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } });

  tl.fromTo(
    state.lineElements,
    {
      yPercent: 0,
      scale: 1,
      rotate: 0,
    },
    WORK_LINE_EXIT,
    0,
  );
  tl.fromTo(
    state.nameChars,
    { opacity: 1 },
    WORK_NAME_CHAR_EXIT,
    0,
  );

  return tl;
}

function scrubTimeline(
  tl: gsap.core.Timeline,
  progress: number,
  onComplete?: () => void,
) {
  return gsap.to(tl, {
    progress,
    duration: tl.duration(),
    ease: WORK_INFO_SCRUB_EASE,
    overwrite: true,
    onComplete,
  });
}

function waitForDomPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function useWorksInfoAnimation(
  refs: WorksInfoAnimationRefs,
  targetWorkIndex: number | null,
  hasPendingRequest: boolean,
  onContentSwap: (index: number | null) => void,
  onContentCommit: () => void,
  onTransitionComplete: () => void,
) {
  const { fontsLoaded } = useGlobalStore();
  const splitStateRef = useRef<SplitState | null>(null);
  const displayedIndexRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const transitionIdRef = useRef(0);
  const scrubTweenRef = useRef<gsap.core.Tween | null>(null);
  const scrubCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      transitionIdRef.current += 1;
      isAnimatingRef.current = false;
      scrubCompleteRef.current?.();
      scrubCompleteRef.current = null;
      scrubTweenRef.current?.kill();
      scrubTweenRef.current = null;
      revertSplitState(splitStateRef.current);
      splitStateRef.current = null;
      if (refs.containerRef.current) {
        gsap.set(refs.containerRef.current, { clearProps: "visibility" });
      }
    };
  }, [refs.containerRef]);

  useEffect(() => {
    if (!fontsLoaded || !hasPendingRequest) return;

    const container = refs.containerRef.current;
    const nameEl = refs.nameRef.current;
    if (!container || !nameEl) return;

    if (
      targetWorkIndex === displayedIndexRef.current &&
      !isAnimatingRef.current
    ) {
      onContentCommit();
      onTransitionComplete();
      return;
    }

    const transitionId = ++transitionIdRef.current;
    const isStale = () => transitionId !== transitionIdRef.current;

    const killScrub = () => {
      scrubCompleteRef.current?.();
      scrubCompleteRef.current = null;
      scrubTweenRef.current?.kill();
      scrubTweenRef.current = null;
    };

    const rebuildSplits = () => {
      revertSplitState(splitStateRef.current);
      splitStateRef.current = buildSplitState(container, nameEl);
      return splitStateRef.current;
    };

    const runScrub = (tl: gsap.core.Timeline, onDone: () => void) =>
      new Promise<void>((resolve) => {
        tl.progress(0);
        const finish = () => {
          tl.kill();
          resolve();
          onDone();
        };
        scrubCompleteRef.current = finish;
        scrubTweenRef.current = scrubTimeline(tl, 1, finish);
      });

    const runEnter = async (state: SplitState) => {
      setHiddenState(state);
      const enterTl = buildEnterTimeline(state);
      await runScrub(enterTl, () => setVisibleState(state));
    };

    const runExit = (state: SplitState) => {
      const exitTl = buildExitTimeline(state);
      return runScrub(exitTl, () => {});
    };

    const swapContent = async (nextIndex: number | null) => {
      gsap.set(container, { visibility: "hidden" });
      revertSplitState(splitStateRef.current);
      splitStateRef.current = null;
      onContentSwap(nextIndex);
      onContentCommit();
      await waitForDomPaint();
    };

    const abortIfStale = () => {
      if (!isStale()) return false;
      isAnimatingRef.current = false;
      return true;
    };

    const transition = async (nextIndex: number | null) => {
      killScrub();
      isAnimatingRef.current = true;

      const hasVisibleContent = displayedIndexRef.current !== null;

      if (hasVisibleContent) {
        if (!splitStateRef.current) {
          splitStateRef.current = rebuildSplits();
        }
        setVisibleState(splitStateRef.current);
        await runExit(splitStateRef.current);
        if (abortIfStale()) return;
      }

      if (nextIndex === null) {
        await swapContent(null);
        if (abortIfStale()) return;
        displayedIndexRef.current = null;
        gsap.set(container, { clearProps: "visibility" });
        onTransitionComplete();
        isAnimatingRef.current = false;
        return;
      }

      await swapContent(nextIndex);
      if (abortIfStale()) return;

      const state = rebuildSplits();
      setHiddenState(state);
      gsap.set(container, { visibility: "visible" });
      await runEnter(state);
      if (abortIfStale()) return;

      displayedIndexRef.current = nextIndex;
      onTransitionComplete();
      isAnimatingRef.current = false;
    };

    void transition(targetWorkIndex);
  }, [
    fontsLoaded,
    hasPendingRequest,
    refs.containerRef,
    refs.nameRef,
    targetWorkIndex,
    onContentSwap,
    onContentCommit,
    onTransitionComplete,
  ]);
}
