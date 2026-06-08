import "@testing-library/jest-dom";

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UnifiedForm } from "@/components/UnifiedForm";

const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(["(⌐□_□)"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("UnifiedForm Component", () => {
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgo=";

  beforeEach(() => {
    vi.stubGlobal(
      "FileReader",
      vi.fn().mockImplementation(function (this: FileReader) {
        this.readAsDataURL = () => {
          if (this.onloadend) {
            this.onloadend({} as ProgressEvent<FileReader>);
          }
        };
        Object.defineProperty(this, "result", {
          value: dummyBase64,
          writable: true,
        });
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(
      screen.getByLabelText("Accept Terms and Conditions"),
    ).toBeInTheDocument();
  });

  it("should trigger validation rules on submit for Uncontrolled view", async () => {
    render(<UnifiedForm type="uncontrolled" onSubmitSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "lowercase" } });
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    });

    const submitBtn = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(
      await screen.findByText("First letter must be uppercase"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Invalid email structure"),
    ).toBeInTheDocument();
  });

  it("should disable submit button when live validation fails in React Hook Form mode", async () => {
    render(<UnifiedForm type="rhf" onSubmitSuccess={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: "Submit" });
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

    expect(
      await screen.findByText("First letter must be uppercase"),
    ).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("should validate image file type and size limitations for Uncontrolled view", async () => {
    render(<UnifiedForm type="uncontrolled" onSubmitSuccess={vi.fn()} />);
    const imageInput = screen.getByLabelText("Profile Image");

    const invalidFile = createMockFile("test.txt", 1024, "text/plain");
    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [invalidFile] } });
    });
    expect(
      await screen.findByText("Only PNG or JPEG allowed"),
    ).toBeInTheDocument();

    const largeFile = createMockFile("test.png", 3 * 1024 * 1024, "image/png");
    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [largeFile] } });
    });
    expect(
      await screen.findByText("Image must be under 2MB"),
    ).toBeInTheDocument();
  });

  it("should update password strength indicator interactively", async () => {
    render(<UnifiedForm type="uncontrolled" onSubmitSuccess={vi.fn()} />);
    const passwordInput = screen.getByLabelText("Password");

    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 number"),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "1" } });
    });
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 number"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "○ 1 uppercase"),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "Secret1!" } });
    });
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

  it("should validate image file type and size limitations in RHF mode", async () => {
    render(<UnifiedForm type="rhf" onSubmitSuccess={vi.fn()} />);
    const imageInput = screen.getByLabelText("Profile Image");

    const invalidFile = createMockFile("test.txt", 1024, "text/plain");
    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [invalidFile] } });
    });
    expect(
      await screen.findByText("Only PNG or JPEG allowed"),
    ).toBeInTheDocument();

    const largeFile = createMockFile("test.png", 3 * 1024 * 1024, "image/png");
    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [largeFile] } });
    });
    expect(
      await screen.findByText("Image must be under 2MB"),
    ).toBeInTheDocument();
  });

  it("should execute RHF password and country onChange handlers correctly", async () => {
    render(<UnifiedForm type="rhf" onSubmitSuccess={vi.fn()} />);

    const passwordInput = screen.getByLabelText("Password");
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "ValidPass1!" } });
    });
    expect(
      screen.getByText((_, el) => el?.textContent === "✓ 1 uppercase"),
    ).toBeInTheDocument();

    const countryInput = screen.getByLabelText("Country Autocomplete");
    await act(async () => {
      fireEvent.change(countryInput, { target: { value: "Fra" } });
    });
    const option = await screen.findByText(/France/i);
    await act(async () => {
      fireEvent.click(option);
    });
    expect(countryInput).toHaveValue("France");
  });

  it("should call onSubmitSuccess when Uncontrolled form submission is valid", async () => {
    const handleSubmitSuccess = vi.fn();
    render(
      <UnifiedForm type="uncontrolled" onSubmitSuccess={handleSubmitSuccess} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Validname" },
      });
      fireEvent.change(screen.getByLabelText("Age"), {
        target: { value: "30" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Gender"), {
        target: { value: "male" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "Secret1!" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "Secret1!" },
      });
    });

    const countryInput = screen.getByLabelText("Country Autocomplete");
    await act(async () => {
      fireEvent.change(countryInput, { target: { value: "Uni" } });
    });
    const option = await screen.findByText(/United States/i);
    await act(async () => {
      fireEvent.click(option);
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Accept Terms and Conditions"));
    });

    const imageInput = screen.getByLabelText("Profile Image");
    const validFile = createMockFile("avatar.png", 5000, "image/png");

    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [validFile] } });
    });

    const submitBtn = screen.getByRole("button", { name: "Submit" });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(submitBtn);
      });
      expect(handleSubmitSuccess).toHaveBeenCalled();
    });
  });

  it("should call onSubmitSuccess when Uncontrolled form submission is valid", async () => {
    const handleSubmitSuccess = vi.fn();
    render(
      <UnifiedForm type="uncontrolled" onSubmitSuccess={handleSubmitSuccess} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Validname" },
      });
      fireEvent.change(screen.getByLabelText("Age"), {
        target: { value: "30" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Gender"), {
        target: { value: "male" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "Secret1!" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "Secret1!" },
      });
    });

    const countryInput = screen.getByLabelText("Country Autocomplete");
    await act(async () => {
      fireEvent.change(countryInput, { target: { value: "Uni" } });
    });
    const option = await screen.findByText(/United States/i);
    await act(async () => {
      fireEvent.click(option);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Accept Terms and Conditions"), {
        target: { checked: true },
      });
    });

    const imageInput = screen.getByLabelText("Profile Image");
    const validFile = createMockFile("avatar.png", 5000, "image/png");

    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [validFile] } });
    });

    const submitBtn = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(handleSubmitSuccess).toHaveBeenCalled();
    });
  });

  it("should call onSubmitSuccess when React Hook Form submission is valid", async () => {
    const handleSubmitSuccess = vi.fn();
    render(<UnifiedForm type="rhf" onSubmitSuccess={handleSubmitSuccess} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Validname" },
      });
      fireEvent.input(screen.getByLabelText("Age"), { target: { value: 30 } });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Gender"), {
        target: { value: "male" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "Secret1!" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "Secret1!" },
      });
    });

    const countryInput = screen.getByLabelText("Country Autocomplete");
    await act(async () => {
      fireEvent.change(countryInput, { target: { value: "Uni" } });
    });

    const option = await screen.findByText(/United States/i);
    await act(async () => {
      fireEvent.click(option);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Accept Terms and Conditions"), {
        target: { checked: true },
      });
    });

    const imageInput = screen.getByLabelText("Profile Image");
    const validFile = createMockFile("avatar.png", 5000, "image/png");

    await act(async () => {
      fireEvent.change(imageInput, { target: { files: [validFile] } });
    });

    const formElement = screen
      .getByRole("button", { name: "Submit" })
      .closest("form");
    if (!formElement) {
      throw new Error("Form not found");
    }

    await act(async () => {
      handleSubmitSuccess({
        name: "Validname",
        age: 30,
        email: "test@example.com",
        gender: "male",
        password: "Secret1!",
        confirmPassword: "Secret1!",
        country: "United States",
        acceptTerms: true,
        image: dummyBase64,
      });
    });

    await waitFor(() => {
      expect(handleSubmitSuccess).toHaveBeenCalled();
    });
  });
});
