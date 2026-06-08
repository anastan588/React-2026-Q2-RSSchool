import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Modal } from "@/components/Modal";

describe("Modal Component (Portals & Accessibility)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render inside portal body when open, and return null when closed", () => {
    const { rerender } = render(
      <Modal isOpen={false} title="Test Modal" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Modal isOpen={true} title="Test Modal" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).toBe(document.body);
  });

  it("should support accessibility properties and ESC key close triggers", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} title="Accessible Modal" onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(
      screen.getByRole("heading", { name: "Accessible Modal" }),
    ).toBeInTheDocument();

    expect(dialog).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should isolate overlay clicks to close, but safe-guard component nodes", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} title="Overlay Modal" onClose={handleClose}>
        <div id="inner-content">Form Content</div>
      </Modal>,
    );

    fireEvent.click(screen.getByText("Form Content"));
    expect(handleClose).not.toHaveBeenCalled();

    const overlay = screen.getByRole("dialog");
    fireEvent.mouseDown(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
