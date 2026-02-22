mod commands;
mod models;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
