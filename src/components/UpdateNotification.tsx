import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Download, RefreshCw, X } from "lucide-react";
import { checkForUpdate, type Update } from "../commands/updater-commands";

type UpdateState = "idle" | "available" | "downloading" | "ready";

export function UpdateNotification() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const scheduleCheck = () => {
      checkForUpdate()
        .then((u) => {
          if (u) {
            // startTransition で低優先度レンダリングにしてUIブロックを防ぐ
            startTransition(() => {
              setUpdate(u);
              setState("available");
            });
          }
        })
        .catch((err) => {
          console.error("[updater] check failed:", err);
        });
    };

    // UIがアイドル状態になってから更新チェックを実行
    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => scheduleCheck(), { timeout: 10000 });
      } else {
        scheduleCheck();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  async function handleUpdate() {
    if (!update) return;
    setState("downloading");
    try {
      await update.downloadAndInstall();
      setState("ready");
    } catch {
      setState("available");
    }
  }

  if (state === "idle" || dismissed) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/15 text-[var(--color-accent-light)] text-sm border-b border-[var(--color-border)]">
      {state === "available" && (
        <>
          <Download size={14} />
          <span>{t("updater.available", { version: update?.version ?? "" })}</span>
          <button
            onClick={handleUpdate}
            className="px-2 py-0.5 rounded bg-[var(--color-accent)] text-white text-xs hover:opacity-90 transition-opacity"
          >
            {t("updater.install")}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="ml-auto p-0.5 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
            title={t("updater.dismiss")}
          >
            <X size={14} />
          </button>
        </>
      )}
      {state === "downloading" && (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>{t("updater.downloading")}</span>
        </>
      )}
      {state === "ready" && (
        <>
          <RefreshCw size={14} />
          <span>{t("updater.ready")}</span>
        </>
      )}
    </div>
  );
}
