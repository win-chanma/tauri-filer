import { describe, it, expect } from "vitest";
import tauriConf from "../src-tauri/tauri.conf.json";

// tauri.conf.json のセキュリティ設定を検証するテスト
// 設定ミスで CSP が無効化されたり、shell open が緩くなるのを防ぐ

describe("tauri.conf.json セキュリティ設定", () => {
  describe("CSP (Content Security Policy)", () => {
    const csp = tauriConf.app.security.csp as string;

    it("CSP が null でないこと", () => {
      expect(csp).not.toBeNull();
      expect(typeof csp).toBe("string");
      expect(csp.length).toBeGreaterThan(0);
    });

    it("default-src が 'self' に制限されていること", () => {
      expect(csp).toMatch(/default-src\s+'self'/);
    });

    it("script-src に 'unsafe-inline' が含まれないこと", () => {
      const scriptSrc = csp.match(/script-src\s+([^;]+)/)?.[1] ?? "";
      expect(scriptSrc).not.toContain("unsafe-inline");
    });

    it("script-src に 'unsafe-eval' が含まれないこと", () => {
      const scriptSrc = csp.match(/script-src\s+([^;]+)/)?.[1] ?? "";
      expect(scriptSrc).not.toContain("unsafe-eval");
    });

    it("img-src に asset protocol が許可されていること", () => {
      const imgSrc = csp.match(/img-src\s+([^;]+)/)?.[1] ?? "";
      expect(imgSrc).toContain("asset:");
      expect(imgSrc).toContain("https://asset.localhost");
    });

    it("connect-src に ipc が許可されていること", () => {
      const connectSrc = csp.match(/connect-src\s+([^;]+)/)?.[1] ?? "";
      expect(connectSrc).toContain("ipc:");
    });
  });

  describe("Shell plugin open パターン", () => {
    const pattern = tauriConf.plugins.shell.open;
    const regex = new RegExp(pattern);

    it("パターンが .* (全許可) でないこと", () => {
      expect(pattern).not.toBe(".*");
      expect(pattern).not.toBe("^.*$");
    });

    // 許可すべきパス
    it("Windows 絶対パスを許可する", () => {
      expect(regex.test("C:\\Users\\test\\file.txt")).toBe(true);
      expect(regex.test("D:\\Documents\\image.png")).toBe(true);
      expect(regex.test("E:\\")).toBe(true);
    });

    it("Unix 絶対パスを許可する", () => {
      expect(regex.test("/home/user/file.txt")).toBe(true);
      expect(regex.test("/usr/local/bin/app")).toBe(true);
      expect(regex.test("/")).toBe(true);
    });

    // 拒否すべきパターン
    it("http(s) URL を拒否する", () => {
      expect(regex.test("https://evil.com/malware")).toBe(false);
      expect(regex.test("http://phishing.site")).toBe(false);
    });

    it("相対パスを拒否する", () => {
      expect(regex.test("./malicious.exe")).toBe(false);
      expect(regex.test("../etc/passwd")).toBe(false);
      expect(regex.test("file.txt")).toBe(false);
    });

    it("プロトコルハンドラを拒否する", () => {
      expect(regex.test("javascript:alert(1)")).toBe(false);
      expect(regex.test("data:text/html,<script>")).toBe(false);
      expect(regex.test("file:///etc/passwd")).toBe(false);
      expect(regex.test("ftp://server/file")).toBe(false);
    });

    it("コマンドインジェクションを拒否する", () => {
      expect(regex.test("cmd /c del *")).toBe(false);
      expect(regex.test("powershell -exec bypass")).toBe(false);
      expect(regex.test("bash -c 'rm -rf /'")).toBe(false);
    });
  });
});
