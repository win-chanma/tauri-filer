import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileCard } from "./FileCard";
import type { FileEntry } from "../types";

function makeEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    name: "test.txt",
    path: "/test.txt",
    isDir: false,
    isSymlink: false,
    isHidden: false,
    size: 100,
    modified: "2026-01-01 00:00",
    mimeType: "text/plain",
    ...overrides,
  };
}

const noop = () => {};
const defaultProps = {
  selected: false,
  onSelect: noop as unknown as (e: React.MouseEvent) => void,
  onOpen: noop,
};

describe("FileCard opacity", () => {
  it("does not apply opacity class for normal file", () => {
    render(<FileCard entry={makeEntry()} isCut={false} {...defaultProps} />);
    const card = screen.getByText("test.txt").closest("[class*='flex']")!;
    expect(card.className).not.toMatch(/opacity-/);
  });

  it("applies opacity-[0.55] for hidden file", () => {
    render(
      <FileCard
        entry={makeEntry({ isHidden: true, name: ".hidden" })}
        isCut={false}
        {...defaultProps}
      />
    );
    const card = screen.getByText(".hidden").closest("[class*='flex']")!;
    expect(card.className).toContain("opacity-[0.55]");
  });

  it("applies opacity-[0.4] for cut file", () => {
    render(<FileCard entry={makeEntry()} isCut={true} {...defaultProps} />);
    const card = screen.getByText("test.txt").closest("[class*='flex']")!;
    expect(card.className).toContain("opacity-[0.4]");
  });

  it("applies opacity-[0.22] for hidden + cut file", () => {
    render(
      <FileCard
        entry={makeEntry({ isHidden: true, name: ".hidden" })}
        isCut={true}
        {...defaultProps}
      />
    );
    const card = screen.getByText(".hidden").closest("[class*='flex']")!;
    expect(card.className).toContain("opacity-[0.22]");
  });
});
