import { formatWorkIndex } from "../slideIdToWorkIndex";

export type CarouselDirection = 1 | -1;

export function buildIndexSlots(total: number): string[] {
  if (total <= 0) return [];

  const formatted = Array.from({ length: total }, (_, index) =>
    formatWorkIndex(index),
  );

  return [formatted[total - 1], ...formatted, formatted[0]];
}

export function getCarouselDirection(
  prev: number,
  next: number,
  total: number,
): CarouselDirection {
  if (prev === next || total <= 1) return 1;

  const forwardSteps = (next - prev + total) % total;
  const backwardSteps = (prev - next + total) % total;

  return forwardSteps <= backwardSteps ? 1 : -1;
}

export function getNormalizedSlot(index: number): number {
  return index + 1;
}

export function getAnimatedTargetSlot(
  prev: number,
  next: number,
  direction: CarouselDirection,
  total: number,
): number {
  const prevSlot = getNormalizedSlot(prev);

  if (direction === 1) {
    const isStepForward = next === (prev + 1) % total;
    return isStepForward ? prevSlot + 1 : total + 1;
  }

  const isStepBackward = next === (prev - 1 + total) % total;
  return isStepBackward ? prevSlot - 1 : 0;
}
