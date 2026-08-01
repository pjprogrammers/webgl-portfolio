export function slideIdToWorkIndex(slideId: string | null): number | null {
  if (!slideId) return null;

  const match = slideId.match(/slide-(\d+)/);
  if (!match) return null;

  const index = Number.parseInt(match[1], 10) - 1;
  return Number.isNaN(index) || index < 0 ? null : index;
}

export function formatWorkIndex(index: number): string {
  const oneBased = index + 1;
  return oneBased <= 9 ? `0${oneBased}` : String(oneBased);
}
