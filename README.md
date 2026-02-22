# Tauri Filer

Tauri 2 + React 19 + TypeScript で構築されたクロスプラットフォーム対応のデスクトップファイルマネージャー。

## 機能

- **デュアルビュー**: リスト表示 / グリッド表示の切替
- **タブ**: 複数タブでのディレクトリ閲覧、履歴ナビゲーション (戻る/進む/上へ)
- **ファイル操作**: コピー、移動、削除 (ゴミ箱)、リネーム、新規フォルダ作成
- **ドラッグ&ドロップ**: ファイルのドラッグ&ドロップによる移動・コピー
- **検索**: ディレクトリ内のファイル名検索
- **ファイルプレビュー**: テキストファイルのプレビュー表示
- **ブックマーク**: よく使うディレクトリのブックマーク管理
- **キーボードショートカット**: Ctrl+C/X/V、Delete、F2 等
- **右クリックメニュー**: コンテキストメニューによるファイル操作
- **隠しファイル表示切替**

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Zustand 5 |
| Backend | Rust, Tauri 2 |
| Build | Vite 7, Bun |
| Test | Vitest, Testing Library (Frontend) / cargo test (Backend) |

## 必要な環境

- [Bun](https://bun.sh/) v1.0+
- [Rust](https://rustup.rs/) (stable)
- Tauri 2 の [OS別の依存パッケージ](https://v2.tauri.app/start/prerequisites/)

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/win-chanma/tauri-filer.git
cd tauri-filer

# 依存パッケージのインストール
bun install

# 開発サーバーの起動
bun tauri dev
```

## テスト

```bash
# Frontend テスト
bun run test

# Backend テスト
cd src-tauri && cargo test

# Frontend テスト (ウォッチモード)
bun run test:watch
```

## ビルド

```bash
# プロダクションビルド
bun tauri build
```

## インストール

[Releases](https://github.com/win-chanma/tauri-filer/releases) から各プラットフォーム向けのインストーラーをダウンロードできます。

| プラットフォーム | ファイル |
|---|---|
| Windows | `.msi` / `.exe` (NSIS) |
| macOS (Apple Silicon) | `aarch64.dmg` |
| macOS (Intel) | `x64.dmg` |
| Linux | `.AppImage` / `.deb` / `.rpm` |

### macOS での注意事項

本アプリは署名・公証されていないため、macOS のセキュリティ機能により「アプリが壊れているため開けません」と表示される場合があります。

以下のいずれかの方法で起動できます。

**方法1: ターミナルでquarantine属性を削除**

```bash
xattr -cr /Applications/Tauri\ Filer.app
```

**方法2: システム設定から許可**

1. アプリを開こうとする（エラーが出る）
2. 「システム設定」>「プライバシーとセキュリティ」を開く
3. 「"Tauri Filer"は開発元を確認できないため...」の横にある「このまま開く」をクリック

### Linux (AppImage) での起動

```bash
chmod +x Tauri.Filer_*.AppImage
./Tauri.Filer_*.AppImage
```

FUSE が必要です。未インストールの場合:

```bash
# Arch系 (CachyOS, Manjaro等)
sudo pacman -S fuse2

# Debian/Ubuntu系
sudo apt install libfuse2
```

## プロジェクト構成

```
tauri-filer/
  src/                  # Frontend (React + TypeScript)
    components/         # UI コンポーネント
    stores/             # Zustand ストア
    hooks/              # カスタムフック
    commands/           # Tauri コマンド呼び出し
    utils/              # ユーティリティ関数
    types/              # 型定義
  src-tauri/            # Backend (Rust)
    src/commands/       # Tauri コマンド実装
    src/models/         # データモデル
```

## ライセンス

[MIT](LICENSE)
