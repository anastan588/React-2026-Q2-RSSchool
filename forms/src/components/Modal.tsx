import { useEffect, useRef } from "react";
import { CircleX } from "lucide-react";
import { createPortal } from "react-dom";

import type { ModalProps } from "@/types/types";

export const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      containerRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none overscroll-contain"
      role="dialog"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onMouseDown={handleOverlayClick}
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
            {title}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
            onClick={onClose}
          >
            <span className="sr-only">Закрыть</span>
            <CircleX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
