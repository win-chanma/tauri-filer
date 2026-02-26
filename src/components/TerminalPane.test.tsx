import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TerminalPane } from "./TerminalPane";

// Tauri API のモック
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve(1)),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

describe("TerminalPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("ターミナルコンテナ要素をレンダリングする", () => {
    render(<TerminalPane cwd="/home/user" />);
    const container = screen.getByTestId("terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("ターミナルヘッダーを表示する", () => {
    render(<TerminalPane cwd="/home/user" />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("閉じるボタンを表示する", () => {
    render(<TerminalPane cwd="/home/user" />);
    const closeButton = screen.getByTitle("Close terminal");
    expect(closeButton).toBeInTheDocument();
  });
});
