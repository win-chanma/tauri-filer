import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
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
  width?: number;
}

interface TerminalOutputPayload {
  session_id: number;
  data: string;
}

export function TerminalPane({ cwd, width }: TerminalPaneProps) {
  const { t } = useTranslation();
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);
  const terminalFontSize = useUIStore((s) => s.terminalFontSize);
  const terminalShellPath = useUIStore((s) => s.terminalShellPath);
  const terminalVisible = useUIStore((s) => s.terminalVisible);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);

  const initTerminal = useCallback(async () => {
    if (!termRef.current) return;

    // CSS カスタムプロパティを解決（xterm.js は canvas 描画なので var() が使えない）
    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue("--color-bg-deep").trim() || "#1e1e1e";
    const fgColor = styles.getPropertyValue("--color-text").trim() || "#d4d4d4";

    const cursorColor = styles.getPropertyValue("--color-accent").trim() || "#6366f1";

    const term = new Terminal({
      fontSize: terminalFontSize,
      fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
      theme: {
        background: bgColor,
        foreground: fgColor,
        cursor: cursorColor,
        cursorAccent: bgColor,
        selectionBackground: "rgba(99, 102, 241, 0.3)",
        // ANSI 16 色（標準 + 明るい）
        black: "#1e1e2e",
        red: "#f38ba8",
        green: "#a6e3a1",
        yellow: "#f9e2af",
        blue: "#89b4fa",
        magenta: "#cba6f7",
        cyan: "#94e2d5",
        white: "#cdd6f4",
        brightBlack: "#585b70",
        brightRed: "#f38ba8",
        brightGreen: "#a6e3a1",
        brightYellow: "#f9e2af",
        brightBlue: "#89b4fa",
        brightMagenta: "#cba6f7",
        brightCyan: "#94e2d5",
        brightWhite: "#ffffff",
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);

    // WebGL レンダラーで GPU アクセラレーション（Canvas よりシャープで高速）
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      term.loadAddon(webglAddon);
    } catch {
      // WebGL2 非対応環境では Canvas フォールバック
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // レンダラー初期化完了を待ってから fit → PTY spawn の順で実行
    // fit しないと cols/rows がデフォルト(80x24)のままで表示が崩れる
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch {
          // 初期化タイミングで失敗する場合がある
        }
        resolve();
      });
    });

    // PTY セッションを起動（fit 後の正しい cols/rows を渡す）
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
      requestAnimationFrame(() => {
        try {
          fitAddonRef.current?.fit();
        } catch {
          // fit が失敗する場合がある
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ペイン幅変更・表示切替時に fit を再実行
  useEffect(() => {
    if (!terminalVisible) return;
    requestAnimationFrame(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {
        // fit が失敗する場合がある
      }
    });
  }, [width, terminalVisible]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-deep)]">
      {/* ターミナルヘッダー */}
      <div className="flex items-center justify-between h-7 px-2 border-b border-[var(--color-border)] bg-[var(--color-bg-deep)] shrink-0">
        <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--color-text-muted)]">
          {t("terminal.title")}
        </span>
        <button
          onClick={toggleTerminal}
          className="p-0.5 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          title={t("terminal.close")}
        >
          <X size={12} />
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
