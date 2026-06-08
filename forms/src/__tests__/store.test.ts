import * as reactRedux from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { store, useAppDispatch, useAppSelector } from "@/store/store";

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof reactRedux>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
  };
});

describe("Redux Store configuration", () => {
  it("should initialize with the correct default profile state", () => {
    const state = store.getState();
    expect(state).toHaveProperty("profile");
  });

  it("should return the dispatch function when useAppDispatch is called", () => {
    const mockDispatch = vi.fn();
    vi.mocked(reactRedux.useDispatch).mockReturnValue(mockDispatch);

    const dispatch = useAppDispatch();
    expect(dispatch).toBe(mockDispatch);
    expect(reactRedux.useDispatch).toHaveBeenCalled();
  });

  it("should call useSelector with the correct state selector when useAppSelector is invoked", () => {
    const mockSelector = vi.fn();
    vi.mocked(reactRedux.useSelector).mockImplementation(mockSelector);

    useAppSelector((state) => state.profile);
    expect(reactRedux.useSelector).toHaveBeenCalledWith(expect.any(Function));
  });
});
