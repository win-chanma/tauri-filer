import { Loader2 } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={32} className="text-[var(--color-accent-light)] animate-spin" />
    </div>
  );
}
