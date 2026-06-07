import "@testing-library/jest-dom";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnifiedForm } from "@/components/UnifiedForm";

describe("UnifiedForm Component", () => {
  it("should render all basic and advanced input fields correctly", () => {
    render(<UnifiedForm type="uncontrolled" onSubmitSuccess={vi.fn()} />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Gender")).toBeInTheDocument();
    expect(screen.getByLabelText("Profile Image")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Country Autocomplete")).toBeInTheDocument();
  });

  it("should trigger validation rules on submit for Uncontrolled view", async () => {
    render(<UnifiedForm type="uncontrolled" onSubmitSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const ageInput = screen.getByLabelText("Age");
    const genderSelect = screen.getByLabelText("Gender");
    const countryInput = screen.getByLabelText("Country Autocomplete");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const termsCheckbox = screen.getByLabelText("Accept Terms and Conditions");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "lowercase" } });
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(ageInput, { target: { value: "25" } });

      fireEvent.change(genderSelect, { target: { value: "male" } });
      fireEvent.change(countryInput, { target: { value: "Ukraine" } });
      fireEvent.change(passwordInput, { target: { value: "Password1!" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "Password1!" },
      });
      fireEvent.click(termsCheckbox);
    });

    const submitBtn = screen.getByRole("button", {
      name: "Submit Uncontrolled Form",
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Асинхронно дожидаемся появления точных ошибок валидации формата из вашей Zod-схемы
    const nameError = await screen.findByText((content) =>
      content.includes("First letter must be uppercase"),
    );
    const emailError = await screen.findByText((content) =>
      content.includes("Invalid email structure"),
    );

    expect(nameError).toBeInTheDocument();
    expect(emailError).toBeInTheDocument();
  });

  it("should disable submit button when live validation fails in React Hook Form mode", async () => {
    render(<UnifiedForm type="rhf" onSubmitSuccess={vi.fn()} />);

    const submitBtn = screen.getByRole("button", {
      name: "Submit React Hook Form",
    });
    expect(submitBtn).toBeDisabled();

    const nameInput = screen.getByLabelText("Name");
    const formElement = nameInput.closest("form");

    if (!formElement) {
      throw new Error("Form element not found in the DOM tree");
    }

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "lowercase" } });
      fireEvent.blur(nameInput);
      fireEvent.submit(formElement);
    });

    const errorMessage = await screen.findByText((content) =>
      content.includes("First letter must be uppercase"),
    );
    expect(errorMessage).toBeInTheDocument();

    expect(submitBtn).toBeDisabled();
  });
});
