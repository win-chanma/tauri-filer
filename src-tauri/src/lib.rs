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
        .manage(PtyManager::new())
        .setup(|app| {
            use tauri::Manager;
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
            read_clipboard_files,
            write_clipboard_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
