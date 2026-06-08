import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: (el: HTMLElement) => mockCreateRoot(el),
  },
}));

vi.mock("@/App", () => ({
  default: () => <div data-testid="app-mock" />,
}));

vi.mock("@/store/store", () => ({
  store: {},
}));

describe("Application Entry Point", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("should initialize the root element and render the application successfully", async () => {
    await import("./../main");

    const rootElement = document.getElementById("root");
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalledWith(expect.any(Object));

    const renderArgument = mockRender.mock.calls[0][0];
    expect(renderArgument.type).toBe(React.StrictMode);
  });
});
