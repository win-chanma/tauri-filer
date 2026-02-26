import type { TFunction } from "i18next";
import type { FileEntry } from "../types";

export interface MenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}

export interface BuildContextMenuItemsParams {
  t: TFunction;
  hasSelection: boolean;
  selectedEntry: FileEntry | null;
  selectedCount: number;
  hasClipboard: boolean;
  onOpen: () => void;
  onPreview: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function buildContextMenuItems(params: BuildContextMenuItemsParams): MenuItem[] {
  const {
    t,
    hasSelection,
    selectedEntry,
    selectedCount,
    hasClipboard,
    onOpen,
    onPreview,
    onCopy,
    onCut,
    onPaste,
    onNewFolder,
    onRename,
    onDelete,
  } = params;

  return [
    ...(hasSelection
      ? [{ label: t("context.open"), onClick: onOpen }]
      : []),
    ...(selectedEntry && !selectedEntry.isDir
      ? [{ label: t("context.preview"), onClick: onPreview }]
      : []),
    ...(hasSelection
      ? [
          { label: t("context.copy"), shortcut: "Ctrl+C", onClick: onCopy },
          { label: t("context.cut"), shortcut: "Ctrl+X", onClick: onCut },
        ]
      : []),
    ...(hasClipboard
      ? [{ label: t("context.paste"), shortcut: "Ctrl+V", onClick: onPaste }]
      : []),
    { separator: true, label: "", onClick: () => {} },
    { label: t("context.newFolder"), shortcut: "Ctrl+Shift+N", onClick: onNewFolder },
    ...(selectedCount === 1
      ? [{ label: t("context.rename"), shortcut: "F2", onClick: onRename }]
      : []),
    ...(hasSelection
      ? [
          { separator: true, label: "", onClick: () => {} },
          { label: t("context.delete"), shortcut: "Del", danger: true, onClick: onDelete },
        ]
      : []),
  ];
}
