<!--
  Tauri Filer - Implementation Plan Infographic
  ブラウザで開いて閲覧: docs/plans/eager-spinning-bunny.md
-->
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tauri Filer - Implementation Plan</title>
<style>
  :root {
    --bg: #0a0a0f;
    --bg-card: #12121a;
    --bg-card-hover: #1a1a28;
    --border: #2a2a3a;
    --accent: #6366f1;
    --accent-light: #818cf8;
    --accent-glow: rgba(99, 102, 241, 0.15);
    --green: #22c55e;
    --green-glow: rgba(34, 197, 94, 0.15);
    --amber: #f59e0b;
    --amber-glow: rgba(245, 158, 11, 0.15);
    --red: #ef4444;
    --cyan: #06b6d4;
    --cyan-glow: rgba(6, 182, 212, 0.15);
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --text-muted: #64748b;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    padding: 2rem;
    min-height: 100vh;
  }

  .container { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, var(--bg-card), #1a1028);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--cyan), var(--green));
  }
  .header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent-light), var(--cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }
  .header .subtitle {
    color: var(--text-dim);
    font-size: 1.1rem;
  }

  /* Tech Stack */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
  }
  .tech-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.2rem;
    text-align: center;
    transition: all 0.2s;
  }
  .tech-item:hover {
    border-color: var(--accent);
    background: var(--bg-card-hover);
    box-shadow: 0 0 20px var(--accent-glow);
  }
  .tech-item .label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.3rem;
  }
  .tech-item .value {
    font-weight: 700;
    font-size: 1rem;
  }

  /* Layout Preview */
  .layout-section {
    margin-bottom: 3rem;
  }
  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .section-title .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .badge-accent { background: var(--accent-glow); color: var(--accent-light); border: 1px solid var(--accent); }
  .badge-green { background: var(--green-glow); color: var(--green); border: 1px solid var(--green); }

  .mockup {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    overflow: hidden;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85rem;
  }
  .mockup-titlebar {
    background: #1e1e2e;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  .mockup-dot {
    width: 12px; height: 12px; border-radius: 50%;
  }
  .dot-red { background: var(--red); }
  .dot-amber { background: var(--amber); }
  .dot-green { background: var(--green); }
  .mockup-title {
    margin-left: 0.5rem;
    color: var(--text-dim);
    font-size: 0.8rem;
  }
  .mockup-body {
    display: grid;
    grid-template-columns: 180px 1fr;
    grid-template-rows: auto auto 1fr auto;
    min-height: 350px;
  }
  .mockup-tabs {
    grid-column: 1 / -1;
    background: #16162a;
    padding: 0.5rem 1rem;
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
  }
  .mock-tab {
    padding: 0.35rem 1rem;
    border-radius: 0.5rem 0.5rem 0 0;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
  .mock-tab.active {
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom: 1px solid var(--bg-card);
  }
  .mock-tab.add { color: var(--text-muted); }
  .mockup-toolbar {
    grid-column: 1 / -1;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 0.8rem;
  }
  .mock-btn {
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    color: var(--text-dim);
  }
  .mock-path {
    flex: 1;
    padding: 0.3rem 0.8rem;
    background: #0a0a14;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    color: var(--cyan);
  }
  .mockup-sidebar {
    padding: 1rem;
    border-right: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 0.8rem;
    line-height: 2;
  }
  .sidebar-item { cursor: pointer; }
  .sidebar-item:hover { color: var(--accent-light); }
  .mockup-files {
    padding: 0.5rem;
  }
  .mock-file-header {
    display: grid;
    grid-template-columns: 1fr 80px 120px;
    padding: 0.4rem 0.8rem;
    color: var(--text-muted);
    font-size: 0.75rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.25rem;
  }
  .mock-file-row {
    display: grid;
    grid-template-columns: 1fr 80px 120px;
    padding: 0.4rem 0.8rem;
    border-radius: 0.3rem;
    font-size: 0.8rem;
    color: var(--text-dim);
  }
  .mock-file-row:hover { background: var(--accent-glow); }
  .mock-file-row .name { color: var(--text); }
  .mock-file-row.dir .name { color: var(--accent-light); }
  .mockup-status {
    grid-column: 1 / -1;
    padding: 0.4rem 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    justify-content: space-between;
  }

  /* Phase Timeline */
  .timeline {
    position: relative;
    margin-bottom: 3rem;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 28px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--accent), var(--cyan), var(--green));
  }
  .phase {
    position: relative;
    padding-left: 72px;
    margin-bottom: 2rem;
  }
  .phase-marker {
    position: absolute;
    left: 12px;
    top: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85rem;
    z-index: 1;
  }
  .phase-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.2s;
  }
  .phase-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 30px var(--accent-glow);
  }
  .phase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .phase-title {
    font-size: 1.2rem;
    font-weight: 700;
  }
  .phase-desc {
    color: var(--text-dim);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .phase-files {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .file-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 0.3rem;
    color: var(--accent-light);
  }
  .file-tag.rust {
    background: rgba(245, 158, 11, 0.08);
    border-color: rgba(245, 158, 11, 0.2);
    color: var(--amber);
  }
  .file-tag.config {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.2);
    color: var(--green);
  }
  .phase-check {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--green);
  }

  /* Architecture */
  .arch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  @media (max-width: 768px) { .arch-grid { grid-template-columns: 1fr; } }
  .arch-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
  }
  .arch-card h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .arch-list {
    list-style: none;
    font-size: 0.9rem;
  }
  .arch-list li {
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(42, 42, 58, 0.5);
    display: flex;
    justify-content: space-between;
  }
  .arch-list li:last-child { border-bottom: none; }
  .arch-list .key { color: var(--text-dim); }
  .arch-list .val { color: var(--text); font-weight: 600; font-family: monospace; font-size: 0.85rem; }

  /* Shortcuts */
  .shortcut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
  }
  .shortcut-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
  }
  .shortcut-item:hover { background: var(--bg-card-hover); }
  .shortcut-key {
    font-family: monospace;
    background: var(--bg-card);
    border: 1px solid var(--border);
    padding: 0.1rem 0.5rem;
    border-radius: 0.3rem;
    font-size: 0.8rem;
    color: var(--accent-light);
  }

  /* Marker colors */
  .marker-0 { background: var(--red); color: #fff; }
  .marker-1 { background: var(--amber); color: #000; }
  .marker-2 { background: #f97316; color: #000; }
  .marker-3 { background: var(--cyan); color: #000; }
  .marker-4 { background: var(--accent); color: #fff; }
  .marker-5 { background: #8b5cf6; color: #fff; }
  .marker-6 { background: var(--green); color: #000; }
  .marker-7 { background: #14b8a6; color: #000; }

  /* Design Decisions */
  .decisions {
    margin-bottom: 3rem;
  }
  .decision-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  .decision-card h4 {
    color: var(--cyan);
    margin-bottom: 0.5rem;
  }
  .decision-card p {
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <h1>Tauri Filer</h1>
    <div class="subtitle">Desktop File Manager -- Tauri v2 + React 19 + TypeScript</div>
  </div>

  <!-- Tech Stack -->
  <div class="section-title">Tech Stack</div>
  <div class="tech-grid">
    <div class="tech-item">
      <div class="label">Framework</div>
      <div class="value" style="color: var(--amber)">Tauri v2</div>
    </div>
    <div class="tech-item">
      <div class="label">Frontend</div>
      <div class="value" style="color: var(--cyan)">React 19</div>
    </div>
    <div class="tech-item">
      <div class="label">Language</div>
      <div class="value" style="color: var(--accent-light)">TypeScript</div>
    </div>
    <div class="tech-item">
      <div class="label">Backend</div>
      <div class="value" style="color: var(--amber)">Rust</div>
    </div>
    <div class="tech-item">
      <div class="label">CSS</div>
      <div class="value" style="color: var(--cyan)">Tailwind v4</div>
    </div>
    <div class="tech-item">
      <div class="label">State</div>
      <div class="value" style="color: var(--green)">Zustand</div>
    </div>
    <div class="tech-item">
      <div class="label">Scroll</div>
      <div class="value" style="color: var(--text)">Virtuoso</div>
    </div>
    <div class="tech-item">
      <div class="label">Bundler</div>
      <div class="value" style="color: var(--accent-light)">Vite 7</div>
    </div>
  </div>

  <!-- Layout Mockup -->
  <div class="layout-section">
    <div class="section-title">
      UI Layout
      <span class="badge badge-accent">Tabbed Single-Pane</span>
    </div>
    <div class="mockup">
      <div class="mockup-titlebar">
        <div class="mockup-dot dot-red"></div>
        <div class="mockup-dot dot-amber"></div>
        <div class="mockup-dot dot-green"></div>
        <span class="mockup-title">Tauri Filer</span>
      </div>
      <div class="mockup-body">
        <div class="mockup-tabs">
          <div class="mock-tab active">Home</div>
          <div class="mock-tab">Documents</div>
          <div class="mock-tab">Downloads</div>
          <div class="mock-tab add">+</div>
        </div>
        <div class="mockup-toolbar">
          <span class="mock-btn">&larr;</span>
          <span class="mock-btn">&rarr;</span>
          <span class="mock-btn">&uarr;</span>
          <span class="mock-path">/home/user</span>
          <span class="mock-btn">Search</span>
          <span class="mock-btn">=</span>
        </div>
        <div class="mockup-sidebar">
          <div class="sidebar-item">Home</div>
          <div class="sidebar-item">Desktop</div>
          <div class="sidebar-item">Documents</div>
          <div class="sidebar-item">Downloads</div>
          <div class="sidebar-item">Pictures</div>
          <div class="sidebar-item" style="margin-top: 1rem; color: var(--text-muted);">--- Drives ---</div>
          <div class="sidebar-item">/</div>
          <div class="sidebar-item">/mnt/data</div>
        </div>
        <div class="mockup-files">
          <div class="mock-file-header">
            <span>Name</span><span>Size</span><span>Modified</span>
          </div>
          <div class="mock-file-row dir"><span class="name">Documents/</span><span>---</span><span>2026-02-20</span></div>
          <div class="mock-file-row dir"><span class="name">Pictures/</span><span>---</span><span>2026-02-18</span></div>
          <div class="mock-file-row dir"><span class="name">.config/</span><span>---</span><span>2026-02-22</span></div>
          <div class="mock-file-row"><span class="name">notes.txt</span><span>4.2KB</span><span>2026-02-21</span></div>
          <div class="mock-file-row"><span class="name">photo.png</span><span>1.8MB</span><span>2026-02-15</span></div>
          <div class="mock-file-row"><span class="name">report.pdf</span><span>340KB</span><span>2026-01-30</span></div>
          <div class="mock-file-row"><span class="name">.bashrc</span><span>3.1KB</span><span>2026-02-10</span></div>
        </div>
        <div class="mockup-status">
          <span>7 items</span>
          <span>2.3 MB selected</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Architecture -->
  <div class="section-title">Architecture</div>
  <div class="arch-grid">
    <div class="arch-card">
      <h3 style="color: var(--cyan)">Zustand Stores</h3>
      <ul class="arch-list">
        <li><span class="key">tab-store</span><span class="val">Tab / History / Navigation</span></li>
        <li><span class="key">file-store</span><span class="val">Entries / Selection / Sort</span></li>
        <li><span class="key">clipboard-store</span><span class="val">Copy / Cut / Paste</span></li>
        <li><span class="key">ui-store</span><span class="val">ViewMode / Sidebar / Menu</span></li>
        <li><span class="key">bookmark-store</span><span class="val">Bookmarks (persisted)</span></li>
      </ul>
    </div>
    <div class="arch-card">
      <h3 style="color: var(--amber)">Rust Commands</h3>
      <ul class="arch-list">
        <li><span class="key">read_directory</span><span class="val">FileEntry[] + metadata</span></li>
        <li><span class="key">copy_items</span><span class="val">Recursive copy</span></li>
        <li><span class="key">move_items</span><span class="val">Move / rename</span></li>
        <li><span class="key">delete_items</span><span class="val">Trash (trash crate)</span></li>
        <li><span class="key">search_files</span><span class="val">walkdir recursive</span></li>
        <li><span class="key">read_file_preview</span><span class="val">Content preview</span></li>
      </ul>
    </div>
    <div class="arch-card">
      <h3 style="color: var(--accent-light)">Frontend Components</h3>
      <ul class="arch-list">
        <li><span class="key">AppLayout</span><span class="val">Sidebar + MainContent</span></li>
        <li><span class="key">TabBar</span><span class="val">Tab management</span></li>
        <li><span class="key">Breadcrumb</span><span class="val">Path navigation</span></li>
        <li><span class="key">ListView / GridView</span><span class="val">Virtual scrolled</span></li>
        <li><span class="key">ContextMenu</span><span class="val">Right-click (Portal)</span></li>
        <li><span class="key">Dialogs</span><span class="val">Create/Rename/Delete</span></li>
      </ul>
    </div>
    <div class="arch-card">
      <h3 style="color: var(--green)">Tauri Plugins</h3>
      <ul class="arch-list">
        <li><span class="key">plugin-fs</span><span class="val">Filesystem access scope</span></li>
        <li><span class="key">plugin-dialog</span><span class="val">Native file picker</span></li>
        <li><span class="key">plugin-shell</span><span class="val">Open with default app</span></li>
        <li><span class="key">plugin-opener</span><span class="val">URL/file opening</span></li>
      </ul>
    </div>
  </div>

  <!-- Phase Timeline -->
  <div class="section-title">Implementation Phases</div>
  <div class="timeline">

    <div class="phase">
      <div class="phase-marker marker-0">0</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Environment Setup</div>
          <span class="badge badge-accent">Prerequisite</span>
        </div>
        <div class="phase-desc">Rust, webkit2gtk, npm packages, Cargo dependencies</div>
        <div class="phase-files">
          <span class="file-tag rust">rustup install</span>
          <span class="file-tag rust">webkit2gtk-4.1</span>
          <span class="file-tag">bun add zustand react-virtuoso lucide-react</span>
          <span class="file-tag">@tailwindcss/vite</span>
          <span class="file-tag">@tauri-apps/plugin-fs,dialog,shell</span>
          <span class="file-tag rust">Cargo.toml (walkdir, trash, chrono)</span>
        </div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-1">1</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Foundation</div>
        </div>
        <div class="phase-desc">Tailwind + Zustand + Rust commands. `bun tauri dev` for the first launch.</div>
        <div class="phase-files">
          <span class="file-tag config">vite.config.ts</span>
          <span class="file-tag config">tailwind.css</span>
          <span class="file-tag config">tauri.conf.json</span>
          <span class="file-tag config">capabilities/default.json</span>
          <span class="file-tag rust">models/file_entry.rs</span>
          <span class="file-tag rust">commands/fs_ops.rs</span>
          <span class="file-tag rust">lib.rs</span>
          <span class="file-tag">types/*.ts</span>
          <span class="file-tag">commands/fs-commands.ts</span>
        </div>
        <div class="phase-check">CHECK: invoke("read_directory") works from devtools</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-2">2</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Layout + File List</div>
        </div>
        <div class="phase-desc">Sidebar + Tabs + File list display with virtual scrolling</div>
        <div class="phase-files">
          <span class="file-tag">stores/tab-store.ts</span>
          <span class="file-tag">stores/file-store.ts</span>
          <span class="file-tag">stores/ui-store.ts</span>
          <span class="file-tag">AppLayout.tsx</span>
          <span class="file-tag">Sidebar.tsx</span>
          <span class="file-tag">TabBar.tsx</span>
          <span class="file-tag">Toolbar.tsx</span>
          <span class="file-tag">Breadcrumb.tsx</span>
          <span class="file-tag">ListView.tsx</span>
          <span class="file-tag">FileRow.tsx</span>
          <span class="file-tag">FileIcon.tsx</span>
          <span class="file-tag">StatusBar.tsx</span>
        </div>
        <div class="phase-check">CHECK: Directory listing shown, click to navigate, tabs work</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-3">3</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Navigation + Grid View</div>
        </div>
        <div class="phase-desc">Full navigation (back/forward/up) + Grid view + Sort</div>
        <div class="phase-files">
          <span class="file-tag">AddressBar.tsx</span>
          <span class="file-tag">GridView.tsx</span>
          <span class="file-tag">FileCard.tsx</span>
          <span class="file-tag">stores/bookmark-store.ts</span>
        </div>
        <div class="phase-check">CHECK: All navigation works, List/Grid toggle, sorting</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-4">4</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">File Operations</div>
        </div>
        <div class="phase-desc">CRUD: Copy, Move, Delete (trash), Create folder, Rename + Keyboard shortcuts</div>
        <div class="phase-files">
          <span class="file-tag rust">fs_ops.rs (copy/move/delete/rename)</span>
          <span class="file-tag">stores/clipboard-store.ts</span>
          <span class="file-tag">NewFolderDialog.tsx</span>
          <span class="file-tag">RenameDialog.tsx</span>
          <span class="file-tag">DeleteConfirmDialog.tsx</span>
          <span class="file-tag">hooks/use-keyboard-shortcuts.ts</span>
        </div>
        <div class="phase-check">CHECK: All CRUD operations work with keyboard shortcuts</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-5">5</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Context Menu + Drag & Drop</div>
        </div>
        <div class="phase-desc">Right-click context menu (React Portal) + HTML5 DnD file moving</div>
        <div class="phase-files">
          <span class="file-tag">ContextMenu.tsx</span>
          <span class="file-tag">hooks/use-context-menu.ts</span>
          <span class="file-tag">hooks/use-drag-drop.ts</span>
        </div>
        <div class="phase-check">CHECK: Right-click menu items work, drag files to folders</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-6">6</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Search + Preview</div>
        </div>
        <div class="phase-desc">Recursive file search (walkdir) + Text/Image preview</div>
        <div class="phase-files">
          <span class="file-tag rust">commands/search.rs</span>
          <span class="file-tag">SearchDialog.tsx</span>
          <span class="file-tag">FilePreviewDialog.tsx</span>
          <span class="file-tag rust">read_file_preview</span>
        </div>
        <div class="phase-check">CHECK: Ctrl+F search works, file preview displays</div>
      </div>
    </div>

    <div class="phase">
      <div class="phase-marker marker-7">7</div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">Polish</div>
          <span class="badge badge-green">Final</span>
        </div>
        <div class="phase-desc">Directory watcher, hidden files toggle, dark mode, error handling, loading states</div>
        <div class="phase-files">
          <span class="file-tag">hooks/use-directory-watcher.ts</span>
          <span class="file-tag">EmptyState.tsx</span>
          <span class="file-tag">Spinner.tsx</span>
          <span class="file-tag config">tauri.conf.json (final)</span>
        </div>
        <div class="phase-check">CHECK: Real-time updates, dark mode, edge cases handled</div>
      </div>
    </div>

  </div>

  <!-- Keyboard Shortcuts -->
  <div class="section-title">Keyboard Shortcuts</div>
  <div class="arch-card" style="margin-bottom: 3rem;">
    <div class="shortcut-grid">
      <div class="shortcut-item"><span>Copy</span><span class="shortcut-key">Ctrl+C</span></div>
      <div class="shortcut-item"><span>Cut</span><span class="shortcut-key">Ctrl+X</span></div>
      <div class="shortcut-item"><span>Paste</span><span class="shortcut-key">Ctrl+V</span></div>
      <div class="shortcut-item"><span>Delete</span><span class="shortcut-key">Delete</span></div>
      <div class="shortcut-item"><span>Rename</span><span class="shortcut-key">F2</span></div>
      <div class="shortcut-item"><span>New Folder</span><span class="shortcut-key">Ctrl+Shift+N</span></div>
      <div class="shortcut-item"><span>Select All</span><span class="shortcut-key">Ctrl+A</span></div>
      <div class="shortcut-item"><span>Search</span><span class="shortcut-key">Ctrl+F</span></div>
      <div class="shortcut-item"><span>New Tab</span><span class="shortcut-key">Ctrl+T</span></div>
      <div class="shortcut-item"><span>Close Tab</span><span class="shortcut-key">Ctrl+W</span></div>
      <div class="shortcut-item"><span>Back</span><span class="shortcut-key">Alt+Left</span></div>
      <div class="shortcut-item"><span>Forward</span><span class="shortcut-key">Alt+Right</span></div>
      <div class="shortcut-item"><span>Parent Dir</span><span class="shortcut-key">Alt+Up</span></div>
      <div class="shortcut-item"><span>Refresh</span><span class="shortcut-key">F5</span></div>
      <div class="shortcut-item"><span>Toggle Sidebar</span><span class="shortcut-key">Ctrl+B</span></div>
      <div class="shortcut-item"><span>Toggle Hidden</span><span class="shortcut-key">Ctrl+H</span></div>
      <div class="shortcut-item"><span>List View</span><span class="shortcut-key">Ctrl+1</span></div>
      <div class="shortcut-item"><span>Grid View</span><span class="shortcut-key">Ctrl+2</span></div>
    </div>
  </div>

  <!-- Design Decisions -->
  <div class="section-title">Key Design Decisions</div>
  <div class="decisions">
    <div class="decision-card">
      <h4>Custom Rust Commands over plugin-fs</h4>
      <p>plugin-fs readDir returns names only, requiring N+1 calls for metadata.
         Custom <code>read_directory</code> fetches all FileEntry data (size, modified, mime_type) in a single Rust call via std::fs::read_dir + metadata().</p>
    </div>
    <div class="decision-card">
      <h4>Virtual Scrolling for Large Directories</h4>
      <p>react-virtuoso keeps DOM node count constant even for 10,000+ file directories (e.g., node_modules).
         ListView uses Virtuoso, GridView uses VirtuosoGrid.</p>
    </div>
    <div class="decision-card">
      <h4>Independent Tab State</h4>
      <p>Each tab maintains its own path, history[], and historyIndex.
         Tab switching triggers file-store.loadDirectory(activeTab.path). Initial implementation reloads on every switch (simplicity over caching).</p>
    </div>
    <div class="decision-card">
      <h4>Safe Deletion via trash crate</h4>
      <p>Files are moved to the system trash (recoverable) instead of permanent deletion.
         The trash Rust crate provides cross-platform trash support.</p>
    </div>
  </div>

  <div class="footer">
    Tauri Filer -- Implementation Plan -- 2026-02-22
  </div>

</div>
</body>
</html>
