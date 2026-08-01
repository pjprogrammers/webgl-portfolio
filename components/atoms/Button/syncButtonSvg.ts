import { gsap } from "@/lib/gsap/registerPlugin";

type SyncOptions = {
  preserveProgress?: boolean;
};

export function syncButtonSvg(
  button: HTMLElement,
  svg: SVGSVGElement,
  rect: SVGRectElement,
  { preserveProgress = false }: SyncOptions = {},
) {
  const { width, height } = button.getBoundingClientRect();
  if (width === 0 || height === 0) return null;

  const r = height / 2;
  const perimeter = 2 * (width - 2 * r) + 2 * Math.PI * r;

  let visibleProgress = 0;
  if (preserveProgress) {
    const dasharray = gsap.getProperty(rect, "strokeDasharray") as number;
    const dashoffset = gsap.getProperty(rect, "strokeDashoffset") as number;
    if (dasharray > 0) {
      visibleProgress = 1 - dashoffset / dasharray;
    }
  }

  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  rect.setAttribute("x", "0.5");
  rect.setAttribute("y", "0.5");
  rect.setAttribute("width", String(width - 1));
  rect.setAttribute("height", String(height - 1));
  rect.setAttribute("rx", String(r - 0.5));

  gsap.set(rect, {
    strokeDasharray: perimeter,
    strokeDashoffset: preserveProgress
      ? perimeter * (1 - visibleProgress)
      : perimeter,
  });

  return perimeter;
}
