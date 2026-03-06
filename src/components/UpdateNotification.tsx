import { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { Download, RefreshCw, X } from "lucide-react";
import { checkUpdateVersion, checkForUpdate } from "../commands/updater-commands";

type UpdateState = "idle" | "available" | "downloading" | "ready";

export const UpdateNotification = memo(function UpdateNotification() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const [version, setVersion] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const scheduleCheck = () => {
      checkUpdateVersion()
        .then((v) => {
          if (v) {
            setVersion(v);
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
    setState("downloading");
    await new Promise((r) => requestAnimationFrame(r));
    try {
      const update = await checkForUpdate();
      if (update) {
        await update.downloadAndInstall();
        setState("ready");
      } else {
        setState("available");
      }
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
