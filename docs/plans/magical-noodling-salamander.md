# SettingsDialog UI/UX 完全リデザイン

## Context

設定画面のUIが「酷すぎる」「クライアントにYESと言わせられない」レベル。Obsidianの設定画面を参考に、UI/UXの基礎から練り直す。視認性・操作性・プロフェッショナルな見た目を実現する。

## 参考: Obsidianの設計思想

- **ゆとりある余白**: 設定行に16px+のパディング
- **明確なタイポグラフィ階層**: ラベル15px、説明13px、セクション見出し11px uppercase
- **大きめのトグル**: ピル型、アクセント色でON状態を明示
- **セクション区切り**: 枠線で囲まず、見出し+薄い区切り線で分離
- **ホバーフィードバック**: 設定行にホバーエフェクト
- **開閉アニメーション**: モーダル出現時のフェード+スケール

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/components/SettingsDialog.tsx` | 全6サブコンポーネントのスタイル刷新 |
| `src/index.css` | ダイアログアニメーション用キーフレーム追加 |
| `src/components/SettingsDialog.test.tsx` | Escキーテスト追加 |

## デザイン仕様

### レイアウト概要

```
+----------------------------------------------------------+
|  OVERLAY: bg-black/50 backdrop-blur-[2px]                |
|                                                          |
|    +--------------------------------------------------+  |
|    |  HEADER (56px)                                    |  |
|    |  px-6                                             |  |
|    |  "Settings" (15px semibold)          [X] (18px)   |  |
|    |---------------------------------------------------|  |
|    |  CONTENT  px-6 pt-6 pb-8                          |  |
|    |                                                   |  |
|    |  DISPLAY  (11px uppercase tracking-wide)          |  |
|    |  mb-4                                             |  |
|    |                                                   |  |
|    |  Show hidden files          [====O] 48x26         |  |
|    |  Display files starting...                        |  |
|    |  ............................................      |  |
|    |  Sidebar                    [====O] 48x26         |  |
|    |  Display the navigation...                        |  |
|    |  ............................................      |  |
|    |  View mode              [ List | Grid ] 160x36    |  |
|    |  Switch the file...                               |  |
|    |                                                   |  |
|    |  gap-8 (32px)                                     |  |
|    |                                                   |  |
|    |  LANGUAGE                                         |  |
|    |  mb-4                                             |  |
|    |                                                   |  |
|    |  Language                [ English  v ] 160x36    |  |
|    |  Select the display...                            |  |
|    |                                                   |  |
|    +--------------------------------------------------+  |
+----------------------------------------------------------+
```

### 主要変更点まとめ

| 要素 | Before | After |
|------|--------|-------|
| ダイアログ幅 | 480px | 540px |
| ダイアログ外枠 | border あり | border なし(shadow のみ) |
| ヘッダー高さ | 48px (h-12) | 56px (h-14) |
| タイトル文字サイズ | 14px (text-sm) | 15px |
| コンテンツ余白 | px-5 py-4 | px-6 pt-6 pb-8 |
| セクション間隔 | 20px (space-y-5) | 32px (space-y-8) |
| セクション見出し下余白 | 8px (mb-2) | 16px (mb-4) |
| セクションコンテナ | rounded-lg border + divide-y | border なし + divide-y opacity-50 |
| 設定行パディング | px-4 py-3 | px-2 py-4 |
| 設定行背景 | bg-card 固定 | transparent + hover エフェクト |
| ラベル文字サイズ | 13px | 14px |
| 説明文字サイズ | 11px | 12.5px |
| ラベル/説明間隔 | 2px (gap-0.5) | 4px (gap-1) |
| トグル幅 | 40px (w-10) | 48px (w-12) |
| トグル高さ | 22px | 26px |
| トグルノブ | 18px | 20px (w-5 h-5) |
| セグメントコントロール | border 囲み | pill-in-tray (bg + rounded-lg p-1) |
| セグメント幅 | auto | 160px 固定 |
| 言語ドロップダウン幅 | auto (~90px) | 160px 固定 |
| 言語ドロップダウン高さ | auto (~30px) | 36px (h-9) |
| 閉じるボタン | p-1.5, icon 16px | p-2, icon 18px |
| オーバーレイ | bg-black/60 | bg-black/50 + backdrop-blur-[2px] |
| アニメーション | なし | fade-in + scale アニメーション |
| フォーカスリング | なし | 全コントロールに focus-visible:ring-2 |
| アクセシビリティ | 最低限 | role="dialog" + aria-modal + Escape キー |

### CSSキーフレーム追加 (`src/index.css`)

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### コンポーネント別仕様

#### SettingsDialog (メイン)
- オーバーレイ: `bg-black/50 backdrop-blur-[2px] animate-[fade-in_150ms_ease-out]`
- ダイアログ: `w-[540px] max-h-[90vh] rounded-xl shadow-2xl shadow-black/40 animate-[dialog-in_200ms_ease-out]`
- `role="dialog" aria-modal="true" aria-labelledby="settings-title"`
- Escapeキーで閉じる: `onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}`

#### SettingsSection
- 枠線コンテナ削除 → `divide-y divide-[var(--color-border)]/50` のみ
- 見出し: `text-[11px] font-semibold uppercase tracking-[0.08em] mb-4 px-2`

#### SettingRow
- `px-2 py-4 rounded-lg hover:bg-[var(--color-bg-hover)]/50 transition-colors duration-150`
- ラベル: `text-[14px] font-medium`
- 説明: `text-[12.5px] leading-relaxed`
- テキスト/コントロール間: `mr-6`

#### ToggleSwitch
- `w-12 h-[26px] p-[3px]` / ノブ `w-5 h-5`
- ON時移動量: `translate-x-[22px]`
- `focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]`

#### SegmentedControl (pill-in-tray パターン)
- コンテナ: `flex bg-[var(--color-bg)] rounded-lg p-1 gap-1 w-[160px]`
- アクティブ: `bg-[var(--color-accent)] text-white rounded-md shadow-sm`
- 非アクティブ: `text-[var(--color-text-dim)] hover:text-[var(--color-text)]`
- アイコンサイズ: 14px → 15px

#### LanguageSelect
- `w-[160px] h-9 rounded-lg text-[13px]`
- パディング: `pl-3.5 pr-8`
- フォーカス: `focus:ring-2 focus:ring-[var(--color-accent)]/20`
- Chevronアイコン: 12px → 14px, `right-3`

## テスト互換性

既存8テストはすべて **変更なしで通過** する（ARIA ロール、ラベル、テキスト、data-testid は全て維持）。

追加テスト:
- Escapeキーで `onClose` が呼ばれること

## 実装ステップ

### Step 1: CSSキーフレーム追加
`src/index.css` に `fade-in` と `dialog-in` アニメーション追加

### Step 2: SettingsDialog.tsx 全面改修
上記仕様に基づいて全6サブコンポーネントのクラスを更新:
1. オーバーレイ + ダイアログコンテナ + ヘッダー
2. SettingsSection (枠線削除)
3. SettingRow (余白拡大 + ホバー)
4. ToggleSwitch (サイズアップ + フォーカスリング)
5. SegmentedControl/Button (pill-in-tray)
6. LanguageSelect (幅統一 + サイズアップ)

### Step 3: テスト追加 + 全テスト通過確認
- Escapeキーテスト追加
- `bun run test` 全テスト通過
- `bunx tsc --noEmit` 型チェック通過

### Step 4: 目視確認
- `bun run tauri dev` でアプリ起動
- 設定画面の見た目を確認

## 検証方法

1. `bun run test` -- 全テスト通過
2. `bunx tsc --noEmit` -- 型チェック通過
3. 目視確認: Tauriアプリで設定画面を開き、余白・フォント・トグル・セグメント・ドロップダウンの見た目が仕様通りか確認
