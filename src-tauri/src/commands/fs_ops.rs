use crate::models::FileEntry;
use std::path::Path;

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("パスが存在しません: {}", path));
    }
    if !dir_path.is_dir() {
        return Err(format!("ディレクトリではありません: {}", path));
    }

    let mut entries: Vec<FileEntry> = std::fs::read_dir(dir_path)
        .map_err(|e| format!("ディレクトリ読み取りエラー: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            FileEntry::from_path(&entry.path())
        })
        .collect();

    // ディレクトリを先に、名前でソート
    entries.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then_with(|| {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        })
    });

    Ok(entries)
}

#[tauri::command]
pub fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "ホームディレクトリが見つかりません".to_string())
}

#[tauri::command]
pub fn copy_items(sources: Vec<String>, destination: String) -> Result<(), String> {
    let dest_path = Path::new(&destination);
    if !dest_path.is_dir() {
        return Err("コピー先がディレクトリではありません".to_string());
    }

    for source in &sources {
        let src_path = Path::new(source);
        let file_name = src_path
            .file_name()
            .ok_or_else(|| format!("ファイル名が取得できません: {}", source))?;
        let dest = dest_path.join(file_name);

        if src_path.is_dir() {
            copy_dir_recursive(src_path, &dest)?;
        } else {
            std::fs::copy(src_path, &dest)
                .map_err(|e| format!("コピー失敗: {} -> {}: {}", source, dest.display(), e))?;
        }
    }

    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    std::fs::create_dir_all(dst)
        .map_err(|e| format!("ディレクトリ作成失敗: {}", e))?;

    for entry in std::fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            std::fs::copy(&src_path, &dst_path)
                .map_err(|e| format!("コピー失敗: {}", e))?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn move_items(sources: Vec<String>, destination: String) -> Result<(), String> {
    let dest_path = Path::new(&destination);
    if !dest_path.is_dir() {
        return Err("移動先がディレクトリではありません".to_string());
    }

    for source in &sources {
        let src_path = Path::new(source);
        let file_name = src_path
            .file_name()
            .ok_or_else(|| format!("ファイル名が取得できません: {}", source))?;
        let dest = dest_path.join(file_name);

        std::fs::rename(src_path, &dest)
            .map_err(|e| format!("移動失敗: {} -> {}: {}", source, dest.display(), e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_items(paths: Vec<String>) -> Result<(), String> {
    for path_str in &paths {
        trash::delete(path_str)
            .map_err(|e| format!("ゴミ箱への移動失敗: {}: {}", path_str, e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn rename_item(path: String, new_name: String) -> Result<String, String> {
    let src_path = Path::new(&path);
    let parent = src_path
        .parent()
        .ok_or_else(|| "親ディレクトリが見つかりません".to_string())?;
    let dest_path = parent.join(&new_name);

    if dest_path.exists() {
        return Err(format!("同名のファイルが既に存在します: {}", new_name));
    }

    std::fs::rename(src_path, &dest_path)
        .map_err(|e| format!("名前変更失敗: {}", e))?;

    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_directory(path: String, name: String) -> Result<String, String> {
    let dir_path = Path::new(&path).join(&name);

    if dir_path.exists() {
        return Err(format!("同名のフォルダが既に存在します: {}", name));
    }

    std::fs::create_dir(&dir_path)
        .map_err(|e| format!("フォルダ作成失敗: {}", e))?;

    Ok(dir_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn search_files(path: String, query: String, max_results: Option<usize>) -> Result<Vec<FileEntry>, String> {
    let max = max_results.unwrap_or(200);
    let query_lower = query.to_lowercase();

    let mut results = Vec::new();

    for entry in walkdir::WalkDir::new(&path)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if results.len() >= max {
            break;
        }

        let name = entry.file_name().to_string_lossy().to_lowercase();
        if name.contains(&query_lower) {
            if let Some(file_entry) = FileEntry::from_path(entry.path()) {
                results.push(file_entry);
            }
        }
    }

    Ok(results)
}

#[tauri::command]
pub fn read_file_preview(path: String, max_bytes: Option<usize>) -> Result<String, String> {
    let max = max_bytes.unwrap_or(10_000);
    let file_path = Path::new(&path);

    if !file_path.is_file() {
        return Err("ファイルではありません".to_string());
    }

    let bytes = std::fs::read(file_path)
        .map_err(|e| format!("ファイル読み取りエラー: {}", e))?;

    let preview_bytes = if bytes.len() > max {
        &bytes[..max]
    } else {
        &bytes
    };

    match String::from_utf8(preview_bytes.to_vec()) {
        Ok(text) => Ok(text),
        Err(_) => Err("バイナリファイルです".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn setup_dir() -> tempfile::TempDir {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("alpha.txt"), "hello").unwrap();
        fs::write(dir.path().join("beta.rs"), "fn main() {}").unwrap();
        fs::create_dir(dir.path().join("gamma_dir")).unwrap();
        dir
    }

    // --- read_directory ---

    #[test]
    fn read_directory_lists_files() {
        let dir = setup_dir();
        let entries = read_directory(dir.path().to_string_lossy().to_string()).unwrap();
        assert_eq!(entries.len(), 3);
    }

    #[test]
    fn read_directory_dirs_first() {
        let dir = setup_dir();
        let entries = read_directory(dir.path().to_string_lossy().to_string()).unwrap();
        assert!(entries[0].is_dir);
        assert!(!entries[1].is_dir);
    }

    #[test]
    fn read_directory_nonexistent_path() {
        let result = read_directory("/nonexistent/path".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("パスが存在しません"));
    }

    #[test]
    fn read_directory_file_not_dir() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("file.txt");
        fs::write(&file, "content").unwrap();

        let result = read_directory(file.to_string_lossy().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("ディレクトリではありません"));
    }

    // --- create_directory ---

    #[test]
    fn create_directory_success() {
        let dir = tempfile::tempdir().unwrap();
        let result = create_directory(
            dir.path().to_string_lossy().to_string(),
            "new_dir".to_string(),
        );
        assert!(result.is_ok());
        assert!(dir.path().join("new_dir").is_dir());
    }

    #[test]
    fn create_directory_already_exists() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir(dir.path().join("existing")).unwrap();

        let result = create_directory(
            dir.path().to_string_lossy().to_string(),
            "existing".to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("同名のフォルダが既に存在します"));
    }

    // --- rename_item ---

    #[test]
    fn rename_item_success() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("old.txt");
        fs::write(&file, "content").unwrap();

        let result = rename_item(
            file.to_string_lossy().to_string(),
            "new.txt".to_string(),
        );
        assert!(result.is_ok());
        assert!(!file.exists());
        assert!(dir.path().join("new.txt").exists());
    }

    #[test]
    fn rename_item_same_name_exists() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("a.txt");
        fs::write(&file, "a").unwrap();
        fs::write(dir.path().join("b.txt"), "b").unwrap();

        let result = rename_item(
            file.to_string_lossy().to_string(),
            "b.txt".to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("同名のファイルが既に存在します"));
    }

    // --- copy_items ---

    #[test]
    fn copy_items_single_file() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("src.txt");
        fs::write(&src, "data").unwrap();
        let dest_dir = dir.path().join("dest");
        fs::create_dir(&dest_dir).unwrap();

        let result = copy_items(
            vec![src.to_string_lossy().to_string()],
            dest_dir.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(dest_dir.join("src.txt").exists());
        assert_eq!(fs::read_to_string(dest_dir.join("src.txt")).unwrap(), "data");
    }

    #[test]
    fn copy_items_recursive_directory() {
        let dir = tempfile::tempdir().unwrap();
        let src_dir = dir.path().join("src_dir");
        fs::create_dir(&src_dir).unwrap();
        fs::write(src_dir.join("file.txt"), "nested").unwrap();
        let dest_dir = dir.path().join("dest");
        fs::create_dir(&dest_dir).unwrap();

        let result = copy_items(
            vec![src_dir.to_string_lossy().to_string()],
            dest_dir.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(dest_dir.join("src_dir").join("file.txt").exists());
    }

    // --- move_items ---

    #[test]
    fn move_items_source_removed() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("move_me.txt");
        fs::write(&src, "data").unwrap();
        let dest_dir = dir.path().join("dest");
        fs::create_dir(&dest_dir).unwrap();

        let result = move_items(
            vec![src.to_string_lossy().to_string()],
            dest_dir.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!src.exists());
        assert!(dest_dir.join("move_me.txt").exists());
    }

    #[test]
    fn move_items_dest_not_dir() {
        let dir = tempfile::tempdir().unwrap();
        let src = dir.path().join("file.txt");
        fs::write(&src, "data").unwrap();

        let result = move_items(
            vec![src.to_string_lossy().to_string()],
            "/nonexistent".to_string(),
        );
        assert!(result.is_err());
    }

    // --- search_files ---

    #[test]
    fn search_files_finds_matches() {
        let dir = setup_dir();
        let results = search_files(
            dir.path().to_string_lossy().to_string(),
            "alpha".to_string(),
            None,
        ).unwrap();
        assert!(results.iter().any(|e| e.name == "alpha.txt"));
    }

    #[test]
    fn search_files_max_results() {
        let dir = setup_dir();
        let results = search_files(
            dir.path().to_string_lossy().to_string(),
            "".to_string(), // 全マッチ
            Some(2),
        ).unwrap();
        assert!(results.len() <= 2);
    }

    #[test]
    fn search_files_case_insensitive() {
        let dir = setup_dir();
        let results = search_files(
            dir.path().to_string_lossy().to_string(),
            "ALPHA".to_string(),
            None,
        ).unwrap();
        assert!(results.iter().any(|e| e.name == "alpha.txt"));
    }

    // --- read_file_preview ---

    #[test]
    fn read_file_preview_text() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("preview.txt");
        fs::write(&file, "hello world").unwrap();

        let result = read_file_preview(file.to_string_lossy().to_string(), None).unwrap();
        assert_eq!(result, "hello world");
    }

    #[test]
    fn read_file_preview_truncated() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("long.txt");
        fs::write(&file, "abcdefghij").unwrap();

        let result = read_file_preview(file.to_string_lossy().to_string(), Some(5)).unwrap();
        assert_eq!(result, "abcde");
    }

    #[test]
    fn read_file_preview_not_a_file() {
        let dir = tempfile::tempdir().unwrap();
        let result = read_file_preview(dir.path().to_string_lossy().to_string(), None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("ファイルではありません"));
    }
}
