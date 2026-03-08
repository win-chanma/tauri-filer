# CLAUDE.md

## プロジェクト概要

Tauri + React + TypeScript のファイラーアプリケーション。

- フレームワーク: Tauri v2
- フロントエンド: React + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`)
- 状態管理: Zustand
- i18n: i18next (ja / en)
- テスト: vitest + @testing-library/react
- パッケージマネージャ: bun

## コマンド

- `bun run dev` — Vite 開発サーバーのみ起動
- `bun run tauri dev` — Tauri アプリとして起動（通常はこちらを使う）
- `bun run test` — テスト実行
- `bun run build` — プロダクションビルド
- `npx playwright test` — Playwright E2E テスト実行（Node.js 必須）
- `npx playwright test --headed` — E2E テスト（ブラウザ表示あり）
- `npx playwright test --ui` — Playwright UI モード

### Playwright E2E テスト

- **Node.js が必要** — Playwright は bun では動作しない（ブラウザプロセスの pipe 通信が未対応）
- 初回は `npx playwright install chromium` でブラウザをインストール
- スクリーンショットのベースライン更新: `npx playwright test --update-snapshots`

### Playwright CLI（開発時のUI確認用）

- `bunx playwright-cli open http://localhost:1420` — ブラウザで開いてインタラクティブに確認
- `bunx playwright-cli screenshot http://localhost:1420 screenshot.png` — スクリーンショット取得

## Git ワークフロー

- **main ブランチには直接コミットしない** — main は保護ブランチとして扱う
- **作業前に必ず `git pull origin main` する** — ローカルが遅れているとコンフリクトやデグレが発生する
- **新しいブランチを切って作業する** — `git checkout -b feat/GH-{Issue番号}-{内容}` で機能ブランチを作成（例: `feat/GH-99-keyboard-nav`）
- **PR (Pull Request) からマージする** — `gh pr create` でPRを作成し、レビュー後にマージ

## テスト方針（t-wada 式 TDD）

テスト実装は TDD（テスト駆動開発）で行う。

1. **Red**: テストを先に書いて失敗させる（期待する動作を明確にする）
2. **Green**: テストが通る最小限の実装を行う
3. **Refactor**: テストが通ったままコードを整理する

- TDD サイクルを1項目ずつ回し、コミットも細かく分ける
- テストを先に書くことで「何が動いていないか」を明確にする
- **機能追加には必ずテストを追加する** — テストのない機能追加は禁止。Rust 側は `cargo test`、フロントは `bun run test` で検証
- **バグ修正にもテストを追加する** — 修正が正しいことを証明するテストを書く

## 技術的な注意点

- **Tauri アプリである。ブラウザで直接デバッグしない。** `bun run tauri dev` で起動し、Tauri ウィンドウ内の DevTools (F12) を使う。
- **`* { padding: 0; }` などのグローバルリセットは使用禁止。** Tailwind v4 はユーティリティを `@layer utilities` に配置するため、レイヤー外のスタイルが優先されて `px-*`, `py-*` 等が無効化される。
- CSS カスタムプロパティは `src/index.css` の `:root` で定義
- Tailwind v4: `@import "tailwindcss"` + `@tailwindcss/vite` プラグイン（設定ファイル不要）

## コミュニケーション

- 日本語で応答する
- コミットやPRに `Co-Authored-By` や `Generated with Claude Code` などの署名を入れない
# test
