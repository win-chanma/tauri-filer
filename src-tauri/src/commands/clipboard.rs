#[cfg(windows)]
mod platform {
    use clipboard_win::{formats, raw, Clipboard, Getter, Setter};

    pub fn read_files() -> Result<(Vec<String>, String), String> {
        let _clip =
            Clipboard::new_attempts(10).map_err(|e| format!("Clipboard open failed: {}", e))?;

        let mut file_list = Vec::new();
        if formats::FileList
            .read_clipboard(&mut file_list)
            .is_err()
        {
            return Ok((vec![], "copy".to_string()));
        }

        if file_list.is_empty() {
            return Ok((vec![], "copy".to_string()));
        }

        // Read Preferred DropEffect to distinguish cut vs copy
        let mode = if let Some(fmt) = raw::register_format("Preferred DropEffect") {
            let mut buf = [0u8; 4];
            if raw::get(fmt.get(), &mut buf).is_ok() {
                let effect = u32::from_le_bytes(buf);
                if effect & 2 != 0 {
                    "cut"
                } else {
                    "copy"
                }
            } else {
                "copy"
            }
        } else {
            "copy"
        };

        Ok((file_list, mode.to_string()))
    }

    pub fn write_files(paths: &[String], mode: &str) -> Result<(), String> {
        let _clip =
            Clipboard::new_attempts(10).map_err(|e| format!("Clipboard open failed: {}", e))?;

        let path_refs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
        formats::FileList
            .write_clipboard(&path_refs)
            .map_err(|e| format!("Write files failed: {}", e))?;

        // Set Preferred DropEffect
        if let Some(fmt) = raw::register_format("Preferred DropEffect") {
            let effect: u32 = if mode == "cut" { 2 } else { 1 };
            let _ = raw::set_without_clear(fmt.get(), &effect.to_le_bytes());
        }

        Ok(())
    }
}

#[cfg(not(windows))]
mod platform {
    pub fn read_files() -> Result<(Vec<String>, String), String> {
        Ok((vec![], "copy".to_string()))
    }

    pub fn write_files(_paths: &[String], _mode: &str) -> Result<(), String> {
        Err("OS clipboard file operations not yet supported on this platform".to_string())
    }
}

#[tauri::command]
pub fn read_clipboard_files() -> Result<(Vec<String>, String), String> {
    platform::read_files()
}

#[tauri::command]
pub fn write_clipboard_files(paths: Vec<String>, mode: String) -> Result<(), String> {
    platform::write_files(&paths, &mode)
}
