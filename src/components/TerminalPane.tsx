import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { listen } from "@tauri-apps/api/event";
import { useUIStore } from "../stores/ui-store";
import {
  terminalSpawn,
  terminalWrite,
  terminalResize,
  terminalKill,
} from "../commands/terminal-commands";
import { X } from "lucide-react";

interface TerminalPaneProps {
  cwd: string;
}

interface TerminalOutputPayload {
  session_id: number;
  data: string;
}

export function TerminalPane({ cwd }: TerminalPaneProps) {
  const { t } = useTranslation();
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);
  const terminalFontSize = useUIStore((s) => s.terminalFontSize);
  const terminalShellPath = useUIStore((s) => s.terminalShellPath);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);

  const initTerminal = useCallback(async () => {
    if (!termRef.current) return;

    // xterm.js インスタンスを作成
    // CSS カスタムプロパティを解決（xterm.js は canvas 描画なので var() が使えない）
    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue("--color-bg-deep").trim() || "#1e1e1e";
    const fgColor = styles.getPropertyValue("--color-text").trim() || "#d4d4d4";

    const term = new Terminal({
      fontSize: terminalFontSize,
      fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
      theme: {
        background: bgColor,
        foreground: fgColor,
      },
      cursorBlink: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // レンダラー初期化完了後に fit を実行
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {
        // 初期化タイミングで失敗する場合がある
      }
    });

    // PTY セッションを起動
    try {
      const sessionId = await terminalSpawn({
        cwd,
        shell: terminalShellPath || undefined,
        cols: term.cols,
        rows: term.rows,
      });
      sessionIdRef.current = sessionId;

      // PTY 出力をリスン
      const unlisten = await listen<TerminalOutputPayload>(
        "terminal_output",
        (event) => {
          if (event.payload.session_id === sessionId) {
            term.write(event.payload.data);
          }
        }
      );
      unlistenRef.current = unlisten;

      // キー入力を PTY に送信
      term.onData((data) => {
        if (sessionIdRef.current !== null) {
          terminalWrite(sessionIdRef.current, data).catch(console.error);
        }
      });

      // ターミナルリサイズを PTY に通知
      term.onResize(({ cols, rows }) => {
        if (sessionIdRef.current !== null) {
          terminalResize(sessionIdRef.current, cols, rows).catch(console.error);
        }
      });
    } catch (err) {
      console.error("ターミナル起動失敗:", err);
      term.write(`\r\nターミナル起動失敗: ${err}\r\n`);
    }
  }, [cwd, terminalFontSize, terminalShellPath]);

  useEffect(() => {
    initTerminal();

    return () => {
      // クリーンアップ: PTY セッション終了
      if (sessionIdRef.current !== null) {
        terminalKill(sessionIdRef.current).catch(console.error);
        sessionIdRef.current = null;
      }
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, [initTerminal]);

  // ウィンドウリサイズ時に fit を再実行
  useEffect(() => {
    const handleResize = () => {
      try {
        fitAddonRef.current?.fit();
      } catch {
        // fit が失敗する場合がある
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-deep)] border-l border-[var(--color-border)]">
      {/* ターミナルヘッダー */}
      <div className="flex items-center justify-between h-8 px-3 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] shrink-0">
        <span className="text-xs font-medium text-[var(--color-text-dim)]">
          {t("terminal.title")}
        </span>
        <button
          onClick={toggleTerminal}
          className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          title={t("terminal.close")}
        >
          <X size={14} />
        </button>
      </div>
      {/* xterm.js コンテナ */}
      <div
        ref={termRef}
        data-testid="terminal-container"
        className="flex-1 min-h-0 overflow-hidden"
      />
    </div>
  );
}
