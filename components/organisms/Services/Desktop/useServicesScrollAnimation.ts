"use client";

import { useEffect, type RefObject } from "react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap/registerPlugin";
import { useGlobalStore } from "@/stores/global-store";
import useMediaQuery, { bp, maxWidth } from "@/lib/hooks/useMediaQuery";

const SERVICE_TITLE_FROM = { yPercent: 320, scale: 1, rotate: 10 };
const SERVICE_TITLE_TO = {
  yPercent: 0,
  scale: 1,
  rotate: 0,
  stagger: 0.07,
  duration: 0.9,
  ease: "power3.out",
};
const SERVICE_TITLE_EXIT = {
  yPercent: 320,
  scale: 1,
  rotate: 10,
  stagger: 0.07,
  duration: 0.9,
  ease: "power3.in",
};

// Timing del título entre servicios:
// - Duración total de salida ≈ SERVICE_TITLE_EXIT.duration + SERVICE_TITLE_EXIT.stagger × (líneas − 1)
//   Con 1 línea: 0.4s | con 2 líneas: 0.47s | con 3 líneas: 0.54s
// - SERVICE_TITLE_ENTER_DELAY: pausa extra (en segundos de timeline) después de que el título
//   anterior termine de salir y antes de que entre el nuevo. Sube el valor para más hueco; baja
//   hacia 0 para pegar la entrada justo al final de la salida.
const SERVICE_TITLE_ENTER_DELAY = -0.1;

const CONTENT_LINE_FROM = { yPercent: 320, scale: 1, rotate: 10 };
// Entrada por card: stagger entre líneas dentro de la misma card (title → highlight → …).
// El stagger entre cards usa CARD_TO.stagger — cada grupo arranca cuando entra su card.
const CONTENT_LINE_TO = {
  yPercent: 0,
  scale: 1,
  rotate: 0,
  stagger: 0.07,
  duration: 0.9,
  ease: "power3.out",
};

const CONTENT_LINE_FROM_EXIT = { yPercent: 0, rotate: 0 };
// Entrada por card: stagger entre líneas dentro de la misma card (title → highlight → …).
// El stagger entre cards usa CARD_TO.stagger — cada grupo arranca cuando entra su card.
const CONTENT_LINE_TO_EXIT = {
  yPercent: 320,
  rotate: 10,
  duration: 0.9,
  stagger: 0.07,
  ease: "power3.in",
};

const HEADING_CHAR_REVEAL = {
  from: { opacity: 0 },
  to: {
    keyframes: [
      { opacity: 0.25 },
      { opacity: 0.5 },
      { opacity: 0.75 },
      { opacity: 1 },
    ],
    stagger: 0.02,
    ease: "power1.inOut",
    duration: 0.7,
  },
};

const HEADING_CHAR_EXIT = {
  from: { opacity: 1 },
  to: {
    keyframes: [
      { opacity: 0.75 },
      { opacity: 0.5 },
      { opacity: 0.25 },
      { opacity: 0 },
    ],
    stagger: {
      each: 0.02,
      from: "end" as const,
    },
    ease: "power1.inOut",
    duration: 0.7,
  },
};

// Salida del contenido por card: sin stagger entre líneas (title, highlight y description
// de la misma card salen juntos). El stagger entre cards usa CARD_EXIT.stagger — cada
// grupo de líneas arranca cuando sale su card.
const CONTENT_LINE_EXIT = {
  yPercent: 320,
  scale: 1,
  rotate: 10,
  stagger: 0,
  duration: 0.4,
  ease: "power3.in",
};

// Timing de entrada del contenido de las cards:
// - CONTENT_LINE_ENTER_DELAY: offset en segundos desde el inicio de entrada de cada card.
//   0 = las líneas arrancan cuando entra su card. Negativo = antes; positivo = después.
// - CONTENT_LINE_TO.stagger: delay entre líneas dentro de la misma card.
// - CARD_TO.stagger: delay entre cards (card y sus líneas comparten este valor).
const CONTENT_LINE_ENTER_DELAY = 0;

const CARD_FROM = { yPercent: 100 };
const CARD_TO = {
  yPercent: 0,
  stagger: 0.1,
  duration: 0.4,
  ease: "power3.out",
};
const CARD_EXIT = {
  yPercent: 100,
  stagger: 0.1,
  duration: 0.4,
  ease: "power3.in",
};

/**
 * Cambio de cards entre servicios (scroll-scrubbed). Ajusta a gusto:
 * - `duration`: tiempo de cada card al salir/entrar
 * - `stagger`: delay entre cards consecutivas
 * - `contentDuration`: líneas de texto dentro de cada card (conviene ≈ duration)
 * - `enterDelay`: offset desde el fin de la salida hasta la entrada
 *   (0 = encadenado, positivo = pausa, negativo = solapamiento salida/entrada)
 *
 * Duración total de salida ≈ duration + stagger × (cards − 1)
 * Con 3 cards y los valores por defecto: 0.75 + 0.36 ≈ 1.11s
 */
const SERVICE_CARD_SWAP = {
  duration: 0.75,
  stagger: 0.18,
  contentDuration: 0.75,
  enterDelay: -0.05,
} as const;

const HOLD_DURATION = 1;

type PanelSplits = {
  lineSplits: SplitText[];
  serviceTitleLines: Element[];
  contentLines: Element[];
  cardContentLines: Element[][];
  cards: HTMLElement[];
};

function splitLines(el: HTMLElement) {
  return new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });
}

function buildPanelSplits(panel: HTMLElement): PanelSplits {
  const lineSplits: SplitText[] = [];
  const serviceTitleLines: Element[] = [];
  const cardContentLines: Element[][] = [];

  const serviceTitleEl = panel.querySelector<HTMLElement>(
    "[data-service-title]",
  );
  if (serviceTitleEl) {
    const split = splitLines(serviceTitleEl);
    lineSplits.push(split);
    serviceTitleLines.push(...split.lines);
  }

  const cards = Array.from(
    panel.querySelectorAll<HTMLElement>("[data-service-card]"),
  );

  cards.forEach((card) => {
    const lines: Element[] = [];
    card.querySelectorAll<HTMLElement>("[data-s-lines]").forEach((el) => {
      const split = splitLines(el);
      lineSplits.push(split);
      lines.push(...split.lines);
    });
    cardContentLines.push(lines);
  });

  const contentLines = cardContentLines.flat();

  return {
    lineSplits,
    serviceTitleLines,
    contentLines,
    cardContentLines,
    cards,
  };
}

function setPanelHidden(panel: PanelSplits) {
  gsap.set(panel.serviceTitleLines, SERVICE_TITLE_FROM);
  gsap.set(panel.contentLines, CONTENT_LINE_FROM);
  gsap.set(panel.cards, CARD_FROM);
}

function serviceTitleExitDuration(lineCount: number) {
  return (
    SERVICE_TITLE_EXIT.duration +
    Math.max(0, lineCount - 1) * SERVICE_TITLE_EXIT.stagger
  );
}

function cardExitDuration(
  cardCount: number,
  duration = CARD_EXIT.duration,
  stagger = CARD_EXIT.stagger,
) {
  return duration + Math.max(0, cardCount - 1) * stagger;
}

function addCardContentEnter(
  tl: gsap.core.Timeline,
  panel: PanelSplits,
  basePosition: string,
  baseOffset = 0,
  cardStagger = CARD_TO.stagger,
  lineTo = CONTENT_LINE_TO,
) {
  panel.cardContentLines.forEach((lines, cardIndex) => {
    if (lines.length === 0) return;
    tl.fromTo(
      lines,
      CONTENT_LINE_FROM,
      { ...lineTo, immediateRender: false },
      `${basePosition}+=${baseOffset + cardIndex * cardStagger + CONTENT_LINE_ENTER_DELAY}`,
    );
  });
}

function addCardContentExit(
  tl: gsap.core.Timeline,
  panel: PanelSplits,
  basePosition: string,
  baseOffset = 0,
  cardStagger = CARD_EXIT.stagger,
  lineExit = CONTENT_LINE_EXIT,
) {
  panel.cardContentLines.forEach((lines, cardIndex) => {
    if (lines.length === 0) return;
    tl.fromTo(
      lines,
      CONTENT_LINE_TO,
      { ...lineExit, immediateRender: false },
      `${basePosition}+=${baseOffset + cardIndex * cardStagger}`,
    );
  });
}

function addServiceTransition(
  tl: gsap.core.Timeline,
  from: PanelSplits,
  to: PanelSplits,
  transitionIndex: number,
) {
  const exitLabel = `serviceExit-${transitionIndex}`;

  tl.addLabel(exitLabel);

  tl.fromTo(
    from.serviceTitleLines,
    SERVICE_TITLE_TO,
    { ...SERVICE_TITLE_EXIT, immediateRender: false },
    exitLabel,
  );
  const swapCardExit = {
    ...CARD_EXIT,
    duration: SERVICE_CARD_SWAP.duration,
    stagger: SERVICE_CARD_SWAP.stagger,
  };
  const swapCardEnter = {
    ...CARD_TO,
    duration: SERVICE_CARD_SWAP.duration,
    stagger: SERVICE_CARD_SWAP.stagger,
  };
  const swapContentExit = {
    ...CONTENT_LINE_EXIT,
    duration: SERVICE_CARD_SWAP.contentDuration,
  };
  const swapContentEnter = {
    ...CONTENT_LINE_TO,
    duration: SERVICE_CARD_SWAP.contentDuration,
  };

  tl.fromTo(
    from.cards,
    { yPercent: 0, opacity: 1 },
    { ...swapCardExit, immediateRender: false },
    exitLabel,
  );
  addCardContentExit(
    tl,
    from,
    exitLabel,
    0,
    SERVICE_CARD_SWAP.stagger,
    swapContentExit,
  );

  const titleEnterAt =
    serviceTitleExitDuration(from.serviceTitleLines.length) +
    SERVICE_TITLE_ENTER_DELAY;

  const cardEnterAt =
    cardExitDuration(
      from.cards.length,
      SERVICE_CARD_SWAP.duration,
      SERVICE_CARD_SWAP.stagger,
    ) + SERVICE_CARD_SWAP.enterDelay;

  // Posición absoluta desde el inicio del exit: titleEnterAt (ver SERVICE_TITLE_ENTER_DELAY arriba).
  tl.fromTo(
    to.serviceTitleLines,
    SERVICE_TITLE_FROM,
    { ...SERVICE_TITLE_TO, immediateRender: false },
    `${exitLabel}+=${titleEnterAt}`,
  );
  tl.fromTo(
    to.cards,
    CARD_FROM,
    { ...swapCardEnter, immediateRender: false },
    `${exitLabel}+=${cardEnterAt}`,
  );
  addCardContentEnter(
    tl,
    to,
    exitLabel,
    cardEnterAt,
    SERVICE_CARD_SWAP.stagger,
    swapContentEnter,
  );
}

function exitServiceTransition(
  tl: gsap.core.Timeline,
  from: PanelSplits,
  transitionIndex: number,
) {
  const exitLabel = `serviceExit-${transitionIndex}`;

  tl.addLabel(exitLabel);

  tl.fromTo(
    from.serviceTitleLines,
    SERVICE_TITLE_TO,
    { ...SERVICE_TITLE_EXIT, immediateRender: false },
    exitLabel,
  );
  const swapCardExit = {
    ...CARD_EXIT,
    duration: SERVICE_CARD_SWAP.duration,
    stagger: SERVICE_CARD_SWAP.stagger,
  };
  const swapContentExit = {
    ...CONTENT_LINE_EXIT,
    duration: SERVICE_CARD_SWAP.contentDuration,
  };

  tl.fromTo(
    from.cards,
    { yPercent: 0, opacity: 1 },
    { ...swapCardExit, immediateRender: false },
    exitLabel,
  );
  addCardContentExit(
    tl,
    from,
    exitLabel,
    0,
    SERVICE_CARD_SWAP.stagger,
    swapContentExit,
  );
}

export function useServicesScrollAnimation(
  servicesSectionRef: RefObject<HTMLElement | null>,
  servicePanelRefs: RefObject<(HTMLDivElement | null)[]>,
  titleRef: RefObject<HTMLHeadingElement | null>,
  descriptionRef: RefObject<HTMLParagraphElement | null>,
) {
  const { fontsLoaded } = useGlobalStore();
  const isMobile = useMediaQuery(maxWidth(bp.mobileLandscape));

  useEffect(() => {
    if (!fontsLoaded) return;
    if (isMobile) return;

    const section = servicesSectionRef.current;
    const headingEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const panels = servicePanelRefs.current.filter(
      (panel): panel is HTMLDivElement => panel !== null,
    );

    if (!section || !headingEl || !descriptionEl || panels.length === 0) {
      return;
    }

    const panelSplits = panels.map(buildPanelSplits);

    const headingSplit = new SplitText(headingEl, {
      type: "chars,words,lines",
      tag: "span",
      linesClass: "overflow-hidden",
    });

    const descriptionSplit = new SplitText(descriptionEl, {
      type: "lines",
      mask: "lines",
      linesClass: "overflow-hidden",
      tag: "div",
    });

    const applyInitialState = () => {
      panelSplits.forEach(setPanelHidden);
      gsap.set(headingSplit.chars, HEADING_CHAR_REVEAL.from);
      gsap.set(descriptionSplit.lines, CONTENT_LINE_FROM);
    };

    applyInitialState();

    const tl = gsap.timeline({
      defaults: { immediateRender: false },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onRefresh: (self) => {
          if (self.progress <= 0) applyInitialState();
        },
      },
    });

    const [firstPanel] = panelSplits;

    tl.addLabel("firstCardsEnter");
    tl.fromTo(firstPanel.cards, CARD_FROM, CARD_TO, "firstCardsEnter");
    addCardContentEnter(tl, firstPanel, "firstCardsEnter");
    tl.fromTo(
      firstPanel.serviceTitleLines,
      SERVICE_TITLE_FROM,
      SERVICE_TITLE_TO,
      "-=0.4",
    );
    tl.fromTo(
      headingSplit.chars,
      HEADING_CHAR_REVEAL.from,
      HEADING_CHAR_REVEAL.to,
      0.1,
    );
    tl.fromTo(
      descriptionSplit.lines,
      CONTENT_LINE_FROM,
      CONTENT_LINE_TO,
      "-=1.3",
    );

    tl.to({}, { duration: HOLD_DURATION });

    for (let index = 1; index < panelSplits.length; index++) {
      addServiceTransition(
        tl,
        panelSplits[index - 1],
        panelSplits[index],
        index,
      );
      tl.to({}, { duration: HOLD_DURATION });
    }

    exitServiceTransition(tl, panelSplits[2], 2);

    tl.fromTo(descriptionSplit.lines, CONTENT_LINE_FROM_EXIT, {
      ...CONTENT_LINE_TO_EXIT,
      stagger: {
        each: 0.07,
        from: "end",
      },
    });
    tl.fromTo(
      headingSplit.chars,
      HEADING_CHAR_EXIT.from,
      HEADING_CHAR_EXIT.to,
      "<",
    );

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      panelSplits.forEach((panel) =>
        panel.lineSplits.forEach((split) => split.revert()),
      );
      headingSplit.revert();
      descriptionSplit.revert();
    };
  }, [
    fontsLoaded,
    servicesSectionRef,
    servicePanelRefs,
    titleRef,
    descriptionRef,
  ]);
}
