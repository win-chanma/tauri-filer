import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsDialog } from "./SettingsDialog";
import { useUIStore } from "../stores/ui-store";

describe("SettingsDialog", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    useUIStore.setState({
      viewMode: "list",
      sidebarVisible: true,
      showHidden: false,
    });
  });

  it("open=falseで何もレンダリングされない", () => {
    const { container } = render(
      <SettingsDialog open={false} onClose={onClose} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("open=trueでダイアログが表示される", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("隠しファイルトグルが動作する", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    const toggle = screen.getByRole("switch", { name: /hidden/i });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(useUIStore.getState().showHidden).toBe(true);
  });

  it("サイドバートグルが動作する", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    const toggle = screen.getByRole("switch", { name: /sidebar/i });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(useUIStore.getState().sidebarVisible).toBe(false);
  });

  it("ビューモード切替が動作する", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    const gridBtn = screen.getByRole("radio", { name: /grid/i });
    fireEvent.click(gridBtn);
    expect(useUIStore.getState().viewMode).toBe("grid");
  });

  it("閉じるボタンでonCloseが呼ばれる", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    const closeBtn = screen.getByTitle("Close");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("オーバーレイクリックでonCloseが呼ばれる", () => {
    render(<SettingsDialog open={true} onClose={onClose} />);
    const overlay = screen.getByTestId("settings-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
