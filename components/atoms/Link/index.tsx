"use client";

import { Link as NextLink, usePathname, useRouter } from "@/i18n/navigation";
import type {
  ComponentProps,
  AnchorHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref,
} from "react";
import { useCallback, useRef } from "react";
import { forwardRef } from "react";

import VariableProximity from "@/components/atoms/VariableProximity";
import { handleParticleTransitionClick } from "@/lib/webgl/particlePageTransition";

type NextLinkProps = ComponentProps<typeof NextLink>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

type CommonProps = {
  children: ReactNode;
  isExternalLink?: boolean;
  isTextLink?: boolean;
  noDataEvent?: boolean;
  hasProximityHover?: boolean;
};

type Props =
  | (CommonProps & {
      isTextLink: true;
      isExternalLink?: false;
    } & ParagraphProps)
  | (CommonProps & {
      isExternalLink: true;
      isTextLink?: false;
      href: AnchorProps["href"];
    } & AnchorProps)
  | (CommonProps & {
      isTextLink?: boolean;
      isExternalLink?: false;
      href: NextLinkProps["href"];
    } & NextLinkProps);

const Link = forwardRef<HTMLAnchorElement, Props>(
  (
    {
      isExternalLink = false,
      isTextLink = false,
      noDataEvent = false,
      hasProximityHover = false,
      children,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const router = useRouter();
    const proximityContainerRef = useRef<HTMLSpanElement>(null);

    const content =
      isTextLink || hasProximityHover ? (
        <span
          ref={proximityContainerRef}
          data-proximity-text
          className="inline"
        >
          <VariableProximity
            label={children as string}
            containerRef={proximityContainerRef}
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 900"
            radius={80}
            falloff="exponential"
          />
        </span>
      ) : (
        children
      );

    const handleInternalClick = useCallback(
      async (
        event: MouseEvent<HTMLAnchorElement>,
        href: NextLinkProps["href"],
      ) => {
        const navigate = await handleParticleTransitionClick(
          event,
          href as string | { pathname?: string | null },
          pathname,
          () => router.push(href as Parameters<typeof router.push>[0]),
        );

        navigate?.();
      },
      [pathname, router],
    );

    if (isTextLink && !("href" in props)) {
      const { ...rest } = props as ParagraphProps;
      return (
        <p
          data-event={noDataEvent ? "simple-hover" : "hover"}
          className="inherit"
          ref={ref as Ref<HTMLParagraphElement>}
          {...rest}
        >
          {content}
        </p>
      );
    }

    if (isExternalLink) {
      const { href, ...rest } = props as AnchorProps;
      return (
        <a
          data-event={noDataEvent ? "simple-hover" : "hover"}
          href={href}
          className="inherit"
          target="_blank"
          rel="noopener noreferrer"
          ref={ref as Ref<HTMLAnchorElement>}
          {...rest}
        >
          {content}
        </a>
      );
    }

    const { href, onClick, ...rest } = props as NextLinkProps;

    return (
      <NextLink
        data-event={noDataEvent ? "simple-hover" : "hover"}
        href={href}
        className="inherit"
        onClick={(event) => {
          void handleInternalClick(event, href);
          onClick?.(event);
        }}
        ref={ref as Ref<HTMLAnchorElement>}
        {...rest}
      >
        {content}
      </NextLink>
    );
  },
);

export default Link;

Link.displayName = "Link";
