"use client";

import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DropdownOption = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  error?: boolean;
  /** When false, forces the menu closed (e.g. parent panel dismissed). */
  active?: boolean;
  /**
   * Portal host inside the same transformed panel as the trigger.
   * Keeps the menu sliding with the panel while staying outside backdrop-filter
   * isolation so backdrop-blur can sample the page behind.
   */
  portalTarget?: HTMLElement | null;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

const CustomDropdown = ({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  error = false,
  active = true,
  portalTarget = null,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((option) => option.value === value);
  const isOpen = open && active;

  // Reset local open when the parent panel dismisses (avoid effect setState).
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active && open) setOpen(false);
  }

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();

    if (portalTarget) {
      const portalRect = portalTarget.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom - portalRect.top,
        left: triggerRect.left - portalRect.left,
        width: triggerRect.width,
      });
      return;
    }

    setPosition({
      top: triggerRect.bottom,
      left: triggerRect.left,
      width: triggerRect.width,
    });
  }, [portalTarget]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const menu = position && (
    <ul
      ref={listRef}
      role="listbox"
      data-lenis-prevent
      style={{
        position: portalTarget ? "absolute" : "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
      }}
      className={classNames(
        "z-10 max-h-0 overflow-hidden bg-brand-10/4 backdrop-blur-[20px] transition-[max-height] duration-400",
        {
          "pointer-events-auto max-h-c-160! overflow-y-auto border-t border-brand-10/10":
            isOpen,
          "pointer-events-none": !isOpen,
        },
      )}
    >
      {options.map((option) => (
        <li
          key={option.value}
          role="option"
          aria-selected={option.value === value}
        >
          <button
            type="button"
            data-event="hover"
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={classNames(
              "block w-full px-c-16 py-3 text-left body-md transition-colors duration-200 hover:bg-brand-05/6",
              { "bg-brand-05/6": option.value === value },
            )}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );

  const portalNode =
    portalTarget ?? (typeof document !== "undefined" ? document.body : null);

  return (
    <div ref={containerRef} className="relative border-t border-brand-10/10">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        data-event="hover"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-20 max-h-[10vh] w-full px-c-16 py-3 flex flex-col justify-start text-left cursor-pointer"
      >
        <span className="body-xs pointer-events-none flex items-center gap-1.5">
          {label}
          {error && (
            <span
              aria-hidden="true"
              className="block w-1 h-1 rounded-full bg-red-500"
            />
          )}
        </span>
        <span
          className={classNames("body-md pt-1 pointer-events-none", {
            "text-brand-05/40": !selected,
          })}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={classNames(
            "absolute right-c-16 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none",
            { "rotate-180": isOpen },
          )}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {menu && portalNode ? createPortal(menu, portalNode) : null}
    </div>
  );
};

export default CustomDropdown;
