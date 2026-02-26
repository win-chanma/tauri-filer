use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

/// PTY セッションの状態を保持
struct PtySession {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
    /// stdout 読み取りスレッドの停止フラグ
    kill_flag: Arc<Mutex<bool>>,
}

/// アプリ全体で共有する PTY マネージャ
pub struct PtyManager {
    sessions: Mutex<HashMap<u32, PtySession>>,
    next_id: Mutex<u32>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
            next_id: Mutex::new(1),
        }
    }
}

/// OS デフォルトシェルを検出
fn default_shell() -> String {
    #[cfg(target_os = "windows")]
    {
        // pwsh.exe (PowerShell 7+) を優先、なければ powershell.exe
        if which_exists("pwsh.exe") {
            "pwsh.exe".to_string()
        } else {
            "powershell.exe".to_string()
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string())
    }
}

#[cfg(target_os = "windows")]
fn which_exists(name: &str) -> bool {
    use std::process::Command;
    Command::new("where")
        .arg(name)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// PTY を生成しシェルを起動。stdout を Tauri event でストリーミングする。
#[tauri::command]
pub fn terminal_spawn(
    app: AppHandle,
    state: tauri::State<'_, PtyManager>,
    cwd: Option<String>,
    shell: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
) -> Result<u32, String> {
    let pty_system = native_pty_system();

    let size = PtySize {
        rows: rows.unwrap_or(24),
        cols: cols.unwrap_or(80),
        pixel_width: 0,
        pixel_height: 0,
    };

    let pair = pty_system
        .openpty(size)
        .map_err(|e| format!("PTY オープン失敗: {}", e))?;

    let shell_path = shell.unwrap_or_else(default_shell);
    let mut cmd = CommandBuilder::new(&shell_path);

    if let Some(ref dir) = cwd {
        cmd.cwd(dir);
    }

    // ターミナル種別を設定（TUI アプリの色・描画機能の判定に使われる）
    cmd.env("TERM", "xterm-256color");

    // Claude Code のネストセッション検出を回避するため環境変数を除去
    for key in &["CLAUDECODE", "CLAUDE_CODE"] {
        cmd.env_remove(key);
    }

    pair.slave
        .spawn_command(cmd)
        .map_err(|e| format!("シェル起動失敗: {}", e))?;

    // slave は spawn 後不要なのでドロップ
    drop(pair.slave);

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("writer 取得失敗: {}", e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("reader 取得失敗: {}", e))?;

    let kill_flag = Arc::new(Mutex::new(false));
    let kill_flag_clone = kill_flag.clone();

    // セッション ID を割り当て
    let session_id = {
        let mut next = state.next_id.lock().unwrap();
        let id = *next;
        *next += 1;
        id
    };

    // stdout 読み取りスレッド: PTY の出力を Tauri event で送信
    let app_clone = app.clone();
    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            if *kill_flag_clone.lock().unwrap() {
                break;
            }
            match reader.read(&mut buf) {
                Ok(0) => break, // EOF
                Ok(n) => {
                    // バイナリデータをそのまま Base64 ではなく lossy UTF-8 として送る
                    // xterm.js は UTF-8 テキストを受け取る
                    let text = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit("terminal_output", TerminalOutput {
                        session_id,
                        data: text,
                    });
                }
                Err(_) => break,
            }
        }
    });

    let session = PtySession {
        master: pair.master,
        writer,
        kill_flag,
    };

    state.sessions.lock().unwrap().insert(session_id, session);

    Ok(session_id)
}

/// PTY stdin にデータを書き込む
#[tauri::command]
pub fn terminal_write(
    state: tauri::State<'_, PtyManager>,
    session_id: u32,
    data: String,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("セッション {} が見つかりません", session_id))?;

    session
        .writer
        .write_all(data.as_bytes())
        .map_err(|e| format!("書き込み失敗: {}", e))?;

    session
        .writer
        .flush()
        .map_err(|e| format!("フラッシュ失敗: {}", e))?;

    Ok(())
}

/// PTY ウィンドウサイズを変更
#[tauri::command]
pub fn terminal_resize(
    state: tauri::State<'_, PtyManager>,
    session_id: u32,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let sessions = state.sessions.lock().unwrap();
    let session = sessions
        .get(&session_id)
        .ok_or_else(|| format!("セッション {} が見つかりません", session_id))?;

    session
        .master
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("リサイズ失敗: {}", e))?;

    Ok(())
}

/// PTY セッションを終了
#[tauri::command]
pub fn terminal_kill(
    state: tauri::State<'_, PtyManager>,
    session_id: u32,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    if let Some(session) = sessions.remove(&session_id) {
        *session.kill_flag.lock().unwrap() = true;
        // master をドロップすることで PTY を閉じる
        drop(session);
    }
    Ok(())
}

/// Tauri event で送信する出力データ
#[derive(Clone, serde::Serialize)]
struct TerminalOutput {
    session_id: u32,
    data: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_shell_returns_nonempty() {
        let shell = default_shell();
        assert!(!shell.is_empty());
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn default_shell_is_powershell_on_windows() {
        let shell = default_shell();
        assert!(
            shell == "pwsh.exe" || shell == "powershell.exe",
            "Expected pwsh.exe or powershell.exe, got: {}",
            shell
        );
    }

    #[test]
    fn pty_manager_new_creates_empty() {
        let mgr = PtyManager::new();
        assert!(mgr.sessions.lock().unwrap().is_empty());
        assert_eq!(*mgr.next_id.lock().unwrap(), 1);
    }
}
