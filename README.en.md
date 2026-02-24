<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="Tauri Filer" />
</p>

<h1 align="center">Tauri Filer</h1>

<p align="center">
  <a href="https://github.com/win-chanma/tauri-filer/releases/latest"><img src="https://img.shields.io/github/v/release/win-chanma/tauri-filer" alt="GitHub Release" /></a>
  <a href="https://github.com/win-chanma/tauri-filer/actions/workflows/test.yml"><img src="https://github.com/win-chanma/tauri-filer/actions/workflows/test.yml/badge.svg" alt="Test" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/win-chanma/tauri-filer" alt="License" /></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Tauri-2-24C8D8?logo=tauri&logoColor=white" alt="Tauri 2" />
</p>

<p align="center">
  <a href="README.md">日本語</a>
</p>

A cross-platform desktop file manager built with Tauri 2 + React 19 + TypeScript.

## Features

- **Dual View**: Toggle between list and grid views
- **Tabs**: Browse directories with multiple tabs, history navigation (back/forward/up)
- **File Operations**: Copy, move, delete (trash), rename, create new folder
- **Drag & Drop**: Move and copy files via drag & drop
- **Search**: Search files by name within a directory
- **File Preview**: Preview text files
- **Bookmarks**: Manage bookmarks for frequently used directories
- **Keyboard Shortcuts**: Ctrl+C/X/V, Delete, F2, etc.
- **Context Menu**: File operations via right-click menu
- **Toggle Hidden Files**

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Zustand 5 |
| Backend | Rust, Tauri 2 |
| Build | Vite 7, Bun |
| Test | Vitest, Testing Library (Frontend) / cargo test (Backend) |

## Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Rust](https://rustup.rs/) (stable)
- Tauri 2 [platform-specific dependencies](https://v2.tauri.app/start/prerequisites/)

## Setup

```bash
# Clone the repository
git clone https://github.com/win-chanma/tauri-filer.git
cd tauri-filer

# Install dependencies
bun install

# Start the development server
bun tauri dev
```

## Testing

```bash
# Frontend tests
bun run test

# Backend tests
cd src-tauri && cargo test

# Frontend tests (watch mode)
bun run test:watch
```

## Build

```bash
# Production build
bun tauri build
```

## Installation

Download the installer for your platform from [Releases](https://github.com/win-chanma/tauri-filer/releases).

| Platform | File |
|----------|------|
| Windows | `.msi` / `.exe` (NSIS) |
| macOS (Apple Silicon) | `aarch64.dmg` |
| macOS (Intel) | `x64.dmg` |
| Linux | `.AppImage` / `.deb` / `.rpm` |

### Notes for macOS

This app is not signed or notarized. macOS security may display a message saying "the app is damaged and can't be opened."

You can launch it using one of the following methods:

**Method 1: Remove the quarantine attribute via Terminal**

```bash
xattr -cr /Applications/Tauri\ Filer.app
```

**Method 2: Allow from System Settings**

1. Try to open the app (an error will appear)
2. Open "System Settings" > "Privacy & Security"
3. Click "Open Anyway" next to the message about "Tauri Filer" being from an unidentified developer

### Running on Linux (AppImage)

```bash
chmod +x Tauri.Filer_*.AppImage
./Tauri.Filer_*.AppImage
```

FUSE is required. If not installed:

```bash
# Arch-based (CachyOS, Manjaro, etc.)
sudo pacman -S fuse2

# Debian/Ubuntu-based
sudo apt install libfuse2
```

## Project Structure

```
tauri-filer/
  src/                  # Frontend (React + TypeScript)
    components/         # UI components
    stores/             # Zustand stores
    hooks/              # Custom hooks
    commands/           # Tauri command calls
    utils/              # Utility functions
    types/              # Type definitions
  src-tauri/            # Backend (Rust)
    src/commands/       # Tauri command implementations
    src/models/         # Data models
```

## License

[MIT](LICENSE)
