import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContextMenu } from "./ContextMenu";

function makeItems(overrides: Array<Partial<{ label: string; shortcut: string; onClick: () => void; danger: boolean; separator: boolean }>> = []) {
  if (overrides.length > 0) {
    return overrides.map((item) => ({
      label: item.label ?? "",
      onClick: item.onClick ?? vi.fn(),
      ...item,
    }));
  }
  return [
    { label: "Open", onClick: vi.fn() },
    { label: "Copy", shortcut: "Ctrl+C", onClick: vi.fn() },
  ];
}

const defaultProps = {
  x: 100,
  y: 100,
  onClose: vi.fn(),
};

describe("ContextMenu", () => {
  it("visible=false のとき何も描画しない", () => {
    const { container } = render(
      <ContextMenu {...defaultProps} visible={false} items={makeItems()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("visible=true のとき項目が描画される", () => {
    render(
      <ContextMenu {...defaultProps} visible={true} items={makeItems()} />
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("メニュー項目をクリックすると onClick と onClose が呼ばれる", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={onClose}
        items={makeItems([{ label: "Open", onClick }])}
      />
    );
    fireEvent.click(screen.getByText("Open"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("セパレータが描画される", () => {
    const items = makeItems([
      { label: "Open", onClick: vi.fn() },
      { separator: true, label: "", onClick: vi.fn() },
      { label: "Delete", onClick: vi.fn() },
    ]);
    render(
      <ContextMenu {...defaultProps} visible={true} items={items} />
    );
    const separators = document.body.querySelectorAll(".border-t");
    expect(separators.length).toBe(1);
  });

  it("ショートカットキーが表示される", () => {
    render(
      <ContextMenu
        {...defaultProps}
        visible={true}
        items={makeItems([{ label: "Copy", shortcut: "Ctrl+C", onClick: vi.fn() }])}
      />
    );
    expect(screen.getByText("Ctrl+C")).toBeInTheDocument();
  });

  it("danger 項目に danger スタイルが適用される", () => {
    render(
      <ContextMenu
        {...defaultProps}
        visible={true}
        items={makeItems([{ label: "Delete", danger: true, onClick: vi.fn() }])}
      />
    );
    const button = screen.getByText("Delete").closest("button")!;
    expect(button.className).toContain("text-[var(--color-danger-hover)]");
  });

  it("danger でない項目は通常のテキスト色", () => {
    render(
      <ContextMenu
        {...defaultProps}
        visible={true}
        items={makeItems([{ label: "Open", onClick: vi.fn() }])}
      />
    );
    const button = screen.getByText("Open").closest("button")!;
    expect(button.className).toContain("text-[var(--color-text-dim)]");
  });

  it("Escape キーで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={onClose}
        items={makeItems()}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("外側クリックで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={onClose}
        items={makeItems()}
      />
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("メニュー内クリックでは onClose が呼ばれない（ボタンクリック以外）", () => {
    const onClose = vi.fn();
    render(
      <ContextMenu
        x={100}
        y={100}
        visible={true}
        onClose={onClose}
        items={makeItems([
          { label: "Open", onClick: vi.fn() },
          { separator: true, label: "", onClick: vi.fn() },
          { label: "Copy", onClick: vi.fn() },
        ])}
      />
    );
    // セパレータの div 要素をクリック（ボタンではない）
    const separator = document.querySelector(".border-t")!;
    fireEvent.mouseDown(separator);
    expect(onClose).not.toHaveBeenCalled();
  });
});
