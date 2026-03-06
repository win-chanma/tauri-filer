import { useEffect, useRef, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { Download, RefreshCw, X } from "lucide-react";
import { checkForUpdate, type Update } from "../commands/updater-commands";

type UpdateState = "idle" | "available" | "downloading" | "ready";

export const UpdateNotification = memo(function UpdateNotification() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const updateRef = useRef<Update | null>(null);
  const [version, setVersion] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const scheduleCheck = () => {
      checkForUpdate()
        .then((u) => {
          if (u) {
            updateRef.current = u;
            setVersion(u.version);
            setState("available");
          }
        })
        .catch((err) => {
          console.error("[updater] check failed:", err);
        });
    };

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
    if (!updateRef.current) return;
    setState("downloading");
    try {
      await updateRef.current.downloadAndInstall();
      setState("ready");
    } catch {
      setState("available");
    }
  }

  const visible = state !== "idle" && !dismissed;

  return (
    <div
      className="items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/15 text-[var(--color-accent-light)] text-sm border-b border-[var(--color-border)]"
      style={{ display: visible ? "flex" : "none" }}
    >
      {state === "available" && (
        <>
          <Download size={14} />
          <span>{t("updater.available", { version })}</span>
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
});
