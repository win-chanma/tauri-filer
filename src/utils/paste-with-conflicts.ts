import {
  copyItems,
  moveItems,
  checkCopyConflicts,
  copyItemsWithStrategy,
} from "../commands/fs-commands";
import type { ConflictStrategy } from "../components/CopyConflictDialog";

export interface PasteRequest {
  paths: string[];
  mode: "copy" | "cut" | null;
  destination: string;
}

export interface PasteResult {
  conflicts: string[];
  request: PasteRequest;
}

/** Check for conflicts and return them. If none, execute paste immediately. */
export async function pasteWithConflictCheck(
  req: PasteRequest
): Promise<PasteResult | null> {
  if (req.mode === "cut") {
    // Move never auto-renames — just move
    await moveItems(req.paths, req.destination);
    return null;
  }

  // Check for conflicts
  const conflicts = await checkCopyConflicts(req.paths, req.destination);
  if (conflicts.length === 0) {
    await copyItems(req.paths, req.destination);
    return null;
  }

  // Return conflicts for UI to resolve
  return { conflicts, request: req };
}

/** Execute paste with a resolved strategy */
export async function executePasteWithStrategy(
  req: PasteRequest,
  strategy: ConflictStrategy
): Promise<void> {
  await copyItemsWithStrategy(req.paths, req.destination, strategy);
}
