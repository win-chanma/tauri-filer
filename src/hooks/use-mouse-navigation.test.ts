import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMouseNavigation } from "./use-mouse-navigation";

// useNavigation をモック
const mockBack = vi.fn();
const mockForward = vi.fn();
vi.mock("./use-navigation", () => ({
  useNavigation: () => ({
    back: mockBack,
    forward: mockForward,
    navigateTo: vi.fn(),
    up: vi.fn(),
    refresh: vi.fn(),
  }),
}));

function fireMouseUp(button: number) {
  const event = new MouseEvent("mouseup", { button, bubbles: true });
  const preventDefaultSpy = vi.spyOn(event, "preventDefault");
  window.dispatchEvent(event);
  return { preventDefaultSpy };
}

function fireMouseDown(button: number) {
  const event = new MouseEvent("mousedown", { button, bubbles: true });
  const preventDefaultSpy = vi.spyOn(event, "preventDefault");
  window.dispatchEvent(event);
  return { preventDefaultSpy };
}

describe("useMouseNavigation", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockForward.mockClear();
  });

  it("マウスの戻るボタン（button=3）で back() を呼ぶ", () => {
    renderHook(() => useMouseNavigation());
    fireMouseUp(3);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("マウスの進むボタン（button=4）で forward() を呼ぶ", () => {
    renderHook(() => useMouseNavigation());
    fireMouseUp(4);
    expect(mockForward).toHaveBeenCalledTimes(1);
  });

  it("戻るボタンで preventDefault が呼ばれる", () => {
    renderHook(() => useMouseNavigation());
    const { preventDefaultSpy } = fireMouseUp(3);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("進むボタンで preventDefault が呼ばれる", () => {
    renderHook(() => useMouseNavigation());
    const { preventDefaultSpy } = fireMouseUp(4);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("左クリック（button=0）では何もしない", () => {
    renderHook(() => useMouseNavigation());
    fireMouseUp(0);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockForward).not.toHaveBeenCalled();
  });

  it("右クリック（button=2）では何もしない", () => {
    renderHook(() => useMouseNavigation());
    fireMouseUp(2);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockForward).not.toHaveBeenCalled();
  });

  it("mousedown の戻るボタンで preventDefault が呼ばれる（ブラウザナビゲーション抑制）", () => {
    renderHook(() => useMouseNavigation());
    const { preventDefaultSpy } = fireMouseDown(3);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("mousedown の進むボタンで preventDefault が呼ばれる（ブラウザナビゲーション抑制）", () => {
    renderHook(() => useMouseNavigation());
    const { preventDefaultSpy } = fireMouseDown(4);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("mousedown の左クリックでは preventDefault しない", () => {
    renderHook(() => useMouseNavigation());
    const { preventDefaultSpy } = fireMouseDown(0);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("アンマウント後はイベントリスナーが解除される", () => {
    const { unmount } = renderHook(() => useMouseNavigation());
    unmount();
    fireMouseUp(3);
    fireMouseUp(4);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockForward).not.toHaveBeenCalled();
  });
});
