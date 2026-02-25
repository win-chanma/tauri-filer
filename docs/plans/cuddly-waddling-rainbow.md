# Issue #17: 設定画面 (Settings Dialog) の実装

## Context

現在、隠しファイルの表示やビューモードの切替はツールバーのアイコンでのみ操作可能。設定画面を設けて各種設定を一覧・変更できるようにする。また、UIStoreの設定値（viewMode, sidebarVisible, showHidden）はメモリのみで永続化されていないため、localStorageで永続化する。

## ブランチ

```
git checkout -b feature/17-settings-dialog main
```

## TDDサイクル（t_wada式 Red-Green-Refactor）

### Cycle 1: UIStore に localStorage 永続化を追加

**対象**: `src/stores/ui-store.ts` + `src/stores/ui-store.test.ts`

**Red**: 永続化テストを追加
- `localStorage` にデータがある場合、初期状態が復元される
- 設定変更時に `localStorage` へ保存される

**Green**: BookmarkStoreと同パターンで `loadSettings()` / `saveSettings()` を実装
- ストレージキー: `tauri-filer-ui-settings`
- `subscribe` で状態変更時に自動保存
- 初期値は `loadSettings()` のマージ（壊れたデータの安全処理）

**Refactor**: load/save のヘルパーを整理

### Cycle 2: SettingsDialog コンポーネント

**新規**: `src/components/SettingsDialog.tsx` + `src/components/SettingsDialog.test.tsx`

**Red**: テスト
- open=falseで何もレンダリングされない
- open=trueでダイアログが表示される
- 隠しファイルトグルが動作する
- ビューモード切替が動作する
- サイドバートグルが動作する

**Green**: SearchDialogと同パターンでモーダル実装
- スタイル: `bg-[#12121a] border border-[#2a2a3a] rounded-xl z-50`
- セクション: 「表示」セクション配下に3設定
- 各設定はラベル+トグルスイッチ（またはセレクト）のレイアウト
- UIStoreの状態と直結

### Cycle 3: Toolbar に設定ボタンを追加 + AppLayout に SettingsDialog を統合

**修正**: `src/components/Toolbar.tsx`, `src/components/AppLayout.tsx`

- Toolbar: ギアアイコン (`Settings` from lucide-react) のNavButtonを追加
- AppLayout: `settingsOpen` state を追加、SettingsDialogを配置

## 変更ファイル一覧

| ファイル | 操作 | 内容 |
|---|---|---|
| `src/stores/ui-store.ts` | 修正 | localStorage永続化の追加 |
| `src/stores/ui-store.test.ts` | 修正 | 永続化テスト追加 |
| `src/components/SettingsDialog.tsx` | 新規 | 設定画面ダイアログ |
| `src/components/SettingsDialog.test.tsx` | 新規 | テスト |
| `src/components/Toolbar.tsx` | 修正 | ギアアイコンボタン追加 |
| `src/components/AppLayout.tsx` | 修正 | settingsOpen state + SettingsDialog配置 |

## 設計詳細

### UIStore 永続化パターン（BookmarkStoreに準拠）

```typescript
const STORAGE_KEY = "tauri-filer-ui-settings";

interface UISettings {
  viewMode: ViewMode;
  sidebarVisible: boolean;
  showHidden: boolean;
}

function loadSettings(): Partial<UISettings> { ... }
function saveSettings(settings: UISettings) { ... }
```

### SettingsDialog レイアウト

```
+-----------------------------------+
|  Settings                      [X] |
+-----------------------------------+
|  Display                           |
|  --------------------------------  |
|  Show hidden files      [toggle]   |
|  Sidebar visible        [toggle]   |
|  View mode         [list | grid]   |
+-----------------------------------+
```

- トグルスイッチ: カスタムCSS（`bg-indigo-500`でON、`bg-slate-600`でOFF）
- ビューモード: 2ボタンのセグメントコントロール

### Toolbar のギアアイコン配置

AddressBar の右側、hiddenトグルの左に配置:

```
[Sidebar] [Back] [Forward] [Up] [Refresh] | AddressBar | [Settings] [Hidden] [List] [Grid]
```

## 検証方法

```bash
# Frontendテスト
BUN_TMPDIR=/tmp/claude-1000 bun run test

# 型チェック
bun run tsc --noEmit
```
