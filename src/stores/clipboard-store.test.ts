import { describe, it, expect, beforeEach } from "vitest";
import { useClipboardStore } from "./clipboard-store";

describe("clipboardStore", () => {
  beforeEach(() => {
    useClipboardStore.setState({ paths: [], mode: null });
  });

  it("初期状態: paths空、mode null", () => {
    const state = useClipboardStore.getState();
    expect(state.paths).toEqual([]);
    expect(state.mode).toBeNull();
  });

  it("copy: pathsとmodeを設定する", () => {
    useClipboardStore.getState().copy(["/a", "/b"]);
    const state = useClipboardStore.getState();
    expect(state.paths).toEqual(["/a", "/b"]);
    expect(state.mode).toBe("copy");
  });

  it("cut: pathsとmodeを設定する", () => {
    useClipboardStore.getState().cut(["/x"]);
    const state = useClipboardStore.getState();
    expect(state.paths).toEqual(["/x"]);
    expect(state.mode).toBe("cut");
  });

  it("clear: リセットする", () => {
    useClipboardStore.getState().copy(["/a"]);
    useClipboardStore.getState().clear();
    const state = useClipboardStore.getState();
    expect(state.paths).toEqual([]);
    expect(state.mode).toBeNull();
  });

  it("copy後にcutで上書きされる", () => {
    useClipboardStore.getState().copy(["/a"]);
    useClipboardStore.getState().cut(["/b"]);
    const state = useClipboardStore.getState();
    expect(state.paths).toEqual(["/b"]);
    expect(state.mode).toBe("cut");
  });
});
