import "@testing-library/jest-dom";

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { App } from "@/App";
import profileReducer from "@/store/profileSlice";
import { type FormValues } from "@/utils/ValidationSchema";

vi.mock("@/components/UnifiedForm", () => ({
  UnifiedForm: ({
    onSubmitSuccess,
  }: {
    onSubmitSuccess: (data: FormValues) => void;
  }) => (
    <button
      data-testid="mock-submit-btn"
      type="button"
      onClick={() =>
        onSubmitSuccess({
          name: "John Doe",
          age: 30,
          email: "john@example.com",
          gender: "male",
          password: "Password1!",
          confirmPassword: "Password1!",
          country: "Belarus",
          acceptTerms: true,
          image: "data:image/png;base64,mock",
        })
      }
    >
      Mock Submit
    </button>
  ),
}));

const createMockStore = (initialSubmissions: FormValues[] = []) => {
  return configureStore({
    reducer: {
      profile: profileReducer,
    },
    preloadedState: {
      profile: {
        submissions: initialSubmissions,
      },
    },
  });
};

describe("App Component", () => {
  it("should render workspace headers and empty state message initially", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByText("Profile Workspace")).toBeInTheDocument();
    expect(screen.getByText(/No profiles submitted yet/i)).toBeInTheDocument();
  });

  it("should open and close the modal window when form buttons are clicked", async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const rhfButton = screen.getByRole("button", { name: "React Hook Form" });

    await act(async () => {
      fireEvent.click(rhfButton);
    });

    expect(
      screen.getByText("React Hook Form Implementation"),
    ).toBeInTheDocument();

    // Ищет кнопку по доступному имени "Close" (которое дает атрибут aria-label)
    const closeButton = screen.getByRole("button", { name: /close/i });

    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(
      screen.queryByText("React Hook Form Implementation"),
    ).not.toBeInTheDocument();
  });

  it("should render pre-existing submissions from the global store correctly", () => {
    const existingProfile: FormValues = {
      name: "Alex Smith",
      email: "alex@test.com",
      age: 25,
      gender: "male",
      country: "Canada",
      acceptTerms: true,
      image: "",
      password: "Password1!",
      confirmPassword: "Password1!",
    };
    const store = createMockStore([existingProfile]);

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByText("Alex Smith")).toBeInTheDocument();
    expect(screen.getByText("alex@test.com")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
  });

  it("should close the modal, update history dashboard, and apply a temporary highlight class on a successful form submission", async () => {
    vi.useFakeTimers();
    const store = createMockStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const rhfButton = screen.getByRole("button", { name: "React Hook Form" });
    fireEvent.click(rhfButton);

    const mockSubmit = screen.getByTestId("mock-submit-btn");
    fireEvent.click(mockSubmit);

    expect(
      screen.queryByText("React Hook Form Implementation"),
    ).not.toBeInTheDocument();

    const profileCard = screen.getByText("John Doe").closest(".rounded-book");
    expect(profileCard).toBeInTheDocument();
    expect(profileCard).toHaveClass("border-emerald-500");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(profileCard).not.toHaveClass("border-emerald-500");
    vi.useRealTimers();
  });
});
