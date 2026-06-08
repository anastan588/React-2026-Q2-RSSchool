import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormInput } from "@/components/FormInput";

describe("FormInput Component (Acceptance Criteria & Accessibility)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should support programmatic connectivity between label and input using htmlFor", () => {
    render(
      <FormInput
        id="test-name-input"
        isRHF={false}
        label="Full Name"
        name="name"
      />,
    );

    const label = screen.getByText("Full Name");
    const input = screen.getByLabelText("Full Name");

    expect(label).toHaveAttribute("htmlFor", "test-name-input");
    expect(input).toHaveAttribute("id", "test-name-input");
  });

  it("should collect data correctly in uncontrolled implementation mode", () => {
    const handleChange = vi.fn();
    render(
      <FormInput
        id="uncontrolled-email"
        isRHF={false}
        label="Email Address"
        name="email"
        type="email"
        onChange={handleChange}
      />,
    );

    const input = screen.getByLabelText("Email Address") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "user@example.com" } });

    expect(input.value).toBe("user@example.com");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should integrate seamlessly with React Hook Form registration tokens", () => {
    const mockRegister = vi.fn().mockReturnValue({
      name: "age",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    });

    render(
      <FormInput
        id="rhf-age"
        isRHF={true}
        label="Age Metric"
        name="age"
        register={mockRegister}
        type="number"
        valueAsNumber={true}
      />,
    );

    expect(mockRegister).toHaveBeenCalledWith("age", { valueAsNumber: true });

    const input = screen.getByLabelText("Age Metric");
    expect(input).toBeInTheDocument();
  });

  it("should toggle password visibility safely using lucide-react eye switches", () => {
    render(
      <FormInput
        id="secure-password"
        isRHF={false}
        label="Password"
        name="password"
        type="password"
      />,
    );

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggleButton = screen.getByRole("button", {
      name: "Show password",
    });
    fireEvent.click(toggleButton);

    expect(input.type).toBe("text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });

  it("should visually project semantic error states when boundaries fail", () => {
    render(
      <FormInput
        error="This field is highly required"
        id="error-field"
        isRHF={false}
        label="Target Field"
        name="field"
      />,
    );

    expect(
      screen.getByText("This field is highly required"),
    ).toBeInTheDocument();
  });
});
