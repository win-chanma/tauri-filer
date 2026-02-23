import { useTranslation } from "react-i18next";
import { FolderOpen } from "lucide-react";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
      <FolderOpen size={48} strokeWidth={1} />
      <p className="text-sm">{t("empty.message")}</p>
    </div>
  );
}
