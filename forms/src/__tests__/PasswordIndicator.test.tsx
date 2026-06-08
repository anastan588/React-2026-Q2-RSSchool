import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordIndicator } from "@/components/PasswordIndicator";

describe("PasswordIndicator Component", () => {
  it("should display empty indicators with circles when password value is empty", () => {
    render(<PasswordIndicator value="" />);

    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 uppercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 lowercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 special char"),
    ).toBeInTheDocument();
  });

  it("should dynamically switch indicator states from circle to checkmark based on password complexity", () => {
    const { rerender } = render(<PasswordIndicator value="1" />);
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 uppercase"),
    ).toBeInTheDocument();

    rerender(<PasswordIndicator value="1A" />);
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 uppercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 lowercase"),
    ).toBeInTheDocument();

    rerender(<PasswordIndicator value="1Ab" />);
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 lowercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 special char"),
    ).toBeInTheDocument();

    rerender(<PasswordIndicator value="1Ab!" />);
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 uppercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 lowercase"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 special char"),
    ).toBeInTheDocument();
  });

  it("should apply correct gray and green tailwind text styling based on metrics validity", () => {
    const { container } = render(<PasswordIndicator value="1" />);

    const elements = container.querySelectorAll(".flex.items-center");
    expect(elements[0]).toHaveClass("text-emerald-600");
    expect(elements[1]).toHaveClass("text-gray-400");
    expect(elements[2]).toHaveClass("text-gray-400");
    expect(elements[3]).toHaveClass("text-gray-400");
  });
});
