/**
 * パスユーティリティ
 * Unix パス（/foo/bar）と Windows パス（C:\foo\bar）の両方に対応
 */

/** Windows ドライブルートのパターン（例: C:\） */
const WINDOWS_ROOT_RE = /^[A-Za-z]:\\$/;

/** パスがルートかどうか判定する */
export function isRootPath(path: string): boolean {
  return path === "/" || WINDOWS_ROOT_RE.test(path);
}

/** 末尾のセパレータを除去する（ルートは除く） */
function stripTrailingSep(path: string): string {
  if (isRootPath(path)) return path;
  return path.replace(/[\\/]+$/, "");
}

/** パスの親ディレクトリを返す。ルートの場合は null */
export function getParentPath(path: string): string | null {
  const normalized = stripTrailingSep(path);
  if (isRootPath(normalized)) return null;

  // Windows パス: C:\Users\foo → C:\Users
  const winMatch = normalized.match(/^([A-Za-z]:\\)(.+)$/);
  if (winMatch) {
    const drive = winMatch[1]; // "C:\"
    const rest = winMatch[2]; // "Users\foo"
    const lastSep = rest.lastIndexOf("\\");
    if (lastSep === -1) return drive; // "C:\Users" → "C:\"
    return drive + rest.substring(0, lastSep);
  }

  // Unix パス: /home/user → /home
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash <= 0) return "/"; // "/home" → "/"
  return normalized.substring(0, lastSlash);
}

/** パスの最後のセグメントをラベルとして返す */
export function getPathLabel(path: string): string {
  const normalized = stripTrailingSep(path);
  if (isRootPath(normalized)) return normalized;

  // セパレータで分割して最後の要素を返す
  const parts = normalized.split(/[\\/]/);
  return parts[parts.length - 1] || normalized;
}
