"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

gsap.ticker.lagSmoothing(0);

type SplitTextTarget = ConstructorParameters<typeof GSAPSplitText>[0];
type SplitTextVars = NonNullable<ConstructorParameters<typeof GSAPSplitText>[1]>;

// El texto con efecto de proximidad (VariableProximity, vía <Link hasProximityHover>)
// ya viene partido en spans por letra desde React. Si SplitText vuelve a partirlo,
// rompe el espaciado entre palabras y pelea con el DOM que controla React.
// Por eso lo ignoramos en CUALQUIER instancia de SplitText de la app.
const PROXIMITY_IGNORE_SELECTOR = "[data-proximity-text]";

class SplitText extends GSAPSplitText {
  constructor(target: SplitTextTarget, vars?: SplitTextVars) {
    super(target, {
      aria: "none",
      ...vars,
      ignore: vars?.ignore ?? PROXIMITY_IGNORE_SELECTOR,
    } as SplitTextVars);
  }
}

export { gsap, ScrollTrigger, SplitText };
