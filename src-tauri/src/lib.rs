mod commands;
mod models;
mod terminal;

use commands::*;
use terminal::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_drag::init())
        .manage(PtyManager::new())
        .setup(|app| {
            use tauri::Manager;

            // Clear WebView2 caches to maintain fast startup
            if let Ok(data_dir) = app.path().app_local_data_dir() {
                let webview_dir = data_dir.join("EBWebView");
                let cache_dirs = [
                    webview_dir.join("Default").join("Cache"),
                    webview_dir.join("Default").join("Code Cache"),
                    webview_dir.join("GrShaderCache"),
                    webview_dir.join("ShaderCache"),
                    webview_dir.join("GraphiteDawnCache"),
                ];
                for dir in &cache_dirs {
                    if dir.is_dir() {
                        let _ = std::fs::remove_dir_all(dir);
                    }
                }
            }

            if let Some(window) = app.get_webview_window("main") {
                if let Ok(icon) =
                    tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png"))
                {
                    let _ = window.set_icon(icon);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_directory,
            get_home_dir,
            copy_items,
            move_items,
            delete_items,
            rename_item,
            create_directory,
            search_files,
            read_file_preview,
            terminal::terminal_spawn,
            terminal::terminal_write,
            terminal::terminal_resize,
            terminal::terminal_kill,
            check_update_version,
            check_copy_conflicts,
            copy_items_with_strategy,
            read_clipboard_files,
            write_clipboard_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
