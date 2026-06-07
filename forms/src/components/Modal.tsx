import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { ModalProps } from "@/types/types";

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Track where the mouse down action originally started
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement;

    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleStringKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleStringKey);

    return () => {
      document.removeEventListener("keydown", handleStringKey);
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.classList.add("overflow-hidden");

    return () => {
      document.body.classList.remove("overflow-hidden");
      if (originalOverflow !== "hidden") {
        document.body.style.removeProperty("overflow");
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Store the element where user initially pressed mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target;
  };

  // Only close if BOTH press down and release happen on the overlay itself
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget &&
      mouseDownTargetRef.current === e.currentTarget
    ) {
      onClose();
    }
  };

  const handleSentinelBounce = () => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  };

  return createPortal(
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div tabIndex={0} onFocus={handleSentinelBounce} className="sr-only" />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="flex w-full max-w-lg flex-col rounded-lg bg-white p-6 shadow-xl focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900" id="modal-title">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            aria-label="Close modal"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="button"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="w-full">{children}</div>
      </div>

      <div tabIndex={0} onFocus={handleSentinelBounce} className="sr-only" />
    </div>,
    document.body,
  );
};
