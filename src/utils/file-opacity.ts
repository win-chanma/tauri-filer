export const FILE_OPACITY = { hidden: 0.55, cut: 0.4 } as const;

export function getFileOpacity({
  isHidden,
  isCut,
}: {
  isHidden: boolean;
  isCut: boolean;
}): string | undefined {
  if (!isHidden && !isCut) return undefined;
  let opacity = 1;
  if (isHidden) opacity *= FILE_OPACITY.hidden;
  if (isCut) opacity *= FILE_OPACITY.cut;
  return `opacity-[${Math.round(opacity * 100) / 100}]`;
}
