type ClipboardMode = "copy" | "cut" | null;

export function isCutPath(
  filePath: string,
  clipboardPaths: string[],
  clipboardMode: ClipboardMode
): boolean {
  return clipboardMode === "cut" && clipboardPaths.includes(filePath);
}
