import { useState, useRef, useEffect } from "react";
import { useTabStore } from "../stores/tab-store";
import { useNavigation } from "../hooks/use-navigation";

export function AddressBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const { navigateTo } = useNavigation();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleStartEdit = () => {
    setValue(activeTab?.path || "/");
    setEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const path = value.trim();
    if (path) {
      navigateTo(path);
    }
    setEditing(false);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex-1 mx-2">
        <input
          ref={inputRef}
          className="w-full px-2 py-1 text-sm bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded text-[var(--color-path-text)] outline-none focus:border-[var(--color-accent)]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
        />
      </form>
    );
  }

  return (
    <button
      className="flex-1 mx-2 px-2 py-1 text-sm text-left bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded text-[var(--color-path-text)] hover:border-[var(--color-text-muted)] truncate"
      onClick={handleStartEdit}
    >
      {activeTab?.path || "/"}
    </button>
  );
}
