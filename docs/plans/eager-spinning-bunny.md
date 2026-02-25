# v0.1.1 リリース計画

## Context

現在のバージョンは全ファイルで `0.1.0`。ファイルオープン修正（PR #11）がマージ済みで、
初回公式リリース `v0.1.1` として GitHub Actions でクロスプラットフォームビルド・配布を行う。

リリースワークフロー (`release.yml`) は既に完備されているため、
バージョン番号の更新とタグのプッシュだけで自動ビルド・リリースが走る。

## 作業手順

### 1. Issue 作成
- タイトル: `v0.1.1 リリース`
- 内容: バージョンアップ + 初回リリース配布

### 2. ブランチ作成
```
git checkout -b release/v0.1.1
```

### 3. バージョン番号更新（3ファイル）

| ファイル | 変更箇所 |
|---------|---------|
| `package.json:4` | `"version": "0.1.0"` → `"0.1.1"` |
| `src-tauri/Cargo.toml:3` | `version = "0.1.0"` → `"0.1.1"` |
| `src-tauri/tauri.conf.json:4` | `"version": "0.1.0"` → `"0.1.1"` |

### 4. テスト実行（TDD確認）
```bash
bun run test        # フロントエンド (74テスト)
cargo test          # Rust (29テスト)
```

### 5. コミット・PR・マージ
- コミットメッセージ: `v0.1.1 にバージョンアップ`
- PR 作成 → マージ

### 6. タグ作成・プッシュ（リリーストリガー）
```bash
git tag v0.1.1
git push origin v0.1.1
```

これにより `release.yml` が自動起動し、以下のビルドが走る：
- Linux x86_64 (.deb, .rpm, .AppImage)
- macOS ARM (aarch64) (.dmg)
- macOS Intel (x86_64) (.dmg)
- Windows (.msi, .exe)

### 7. リリース確認
- GitHub Actions のビルド状況を確認
- ドラフトリリースが全ビルド完了後に自動公開される

## 対象ファイル
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## 既存ワークフロー
- `.github/workflows/release.yml` - 変更不要（既に完備）
- `.github/workflows/test.yml` - 変更不要

## 検証
- `bun run test` が全パス
- `cargo test` が全パス
- `git tag v0.1.1 && git push origin v0.1.1` で release.yml が起動
- GitHub Releases にクロスプラットフォームのバイナリが配布される
