use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_symlink: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: Option<String>,
    pub mime_type: Option<String>,
}

fn is_hidden_file(name: &str, metadata: &std::fs::Metadata) -> bool {
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        const FILE_ATTRIBUTE_HIDDEN: u32 = 0x2;
        (metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0) || name.starts_with('.')
    }
    #[cfg(not(windows))]
    {
        let _ = metadata;
        name.starts_with('.')
    }
}

impl FileEntry {
    pub fn from_path(path: &std::path::Path) -> Option<Self> {
        let metadata = path.symlink_metadata().ok()?;
        let name = path.file_name()?.to_string_lossy().to_string();
        let is_hidden = is_hidden_file(&name, &metadata);
        let is_symlink = metadata.is_symlink();

        let real_metadata = if is_symlink {
            std::fs::metadata(path).unwrap_or(metadata.clone())
        } else {
            metadata.clone()
        };

        let is_dir = real_metadata.is_dir();
        let size = if is_dir { 0 } else { real_metadata.len() };

        let modified = real_metadata
            .modified()
            .ok()
            .map(|t| {
                let datetime: chrono::DateTime<chrono::Local> = t.into();
                datetime.format("%Y-%m-%d %H:%M").to_string()
            });

        let mime_type = if is_dir {
            None
        } else {
            guess_mime(&name)
        };

        Some(FileEntry {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir,
            is_symlink,
            is_hidden,
            size,
            modified,
            mime_type,
        })
    }
}

pub(crate) fn guess_mime(name: &str) -> Option<String> {
    let ext = name.rsplit('.').next()?.to_lowercase();
    let mime = match ext.as_str() {
        "txt" | "md" | "log" | "csv" => "text/plain",
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "js" | "mjs" => "text/javascript",
        "ts" | "tsx" => "text/typescript",
        "json" => "application/json",
        "xml" => "application/xml",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        "gz" | "tar" => "application/gzip",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "mp3" => "audio/mpeg",
        "mp4" => "video/mp4",
        "rs" => "text/x-rust",
        "toml" => "text/x-toml",
        "yaml" | "yml" => "text/x-yaml",
        "sh" | "bash" | "zsh" => "text/x-shellscript",
        _ => return None,
    };
    Some(mime.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::Path;

    #[test]
    fn guess_mime_txt() {
        assert_eq!(guess_mime("file.txt"), Some("text/plain".to_string()));
    }

    #[test]
    fn guess_mime_rs() {
        assert_eq!(guess_mime("main.rs"), Some("text/x-rust".to_string()));
    }

    #[test]
    fn guess_mime_png() {
        assert_eq!(guess_mime("image.png"), Some("image/png".to_string()));
    }

    #[test]
    fn guess_mime_unknown_ext() {
        assert_eq!(guess_mime("file.xyz"), None);
    }

    #[test]
    fn guess_mime_no_extension() {
        // 拡張子なしの場合、rsplit('.') は名前全体を返す
        assert_eq!(guess_mime("Makefile"), None);
    }

    #[test]
    fn guess_mime_case_insensitive() {
        assert_eq!(guess_mime("FILE.PNG"), Some("image/png".to_string()));
        assert_eq!(guess_mime("doc.TXT"), Some("text/plain".to_string()));
    }

    #[test]
    fn from_path_regular_file() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        fs::write(&file_path, "hello").unwrap();

        let entry = FileEntry::from_path(&file_path).unwrap();
        assert_eq!(entry.name, "test.txt");
        assert!(!entry.is_dir);
        assert!(!entry.is_hidden);
        assert_eq!(entry.size, 5);
        assert!(entry.modified.is_some());
        assert_eq!(entry.mime_type, Some("text/plain".to_string()));
    }

    #[test]
    fn from_path_directory() {
        let dir = tempfile::tempdir().unwrap();
        let sub_dir = dir.path().join("subdir");
        fs::create_dir(&sub_dir).unwrap();

        let entry = FileEntry::from_path(&sub_dir).unwrap();
        assert_eq!(entry.name, "subdir");
        assert!(entry.is_dir);
        assert_eq!(entry.size, 0);
        assert!(entry.mime_type.is_none());
    }

    #[test]
    fn from_path_hidden_file() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join(".hidden");
        fs::write(&file_path, "").unwrap();

        let entry = FileEntry::from_path(&file_path).unwrap();
        assert!(entry.is_hidden);
    }

    #[test]
    fn from_path_nonexistent() {
        let result = FileEntry::from_path(Path::new("/nonexistent/path/file.txt"));
        assert!(result.is_none());
    }

    #[cfg(not(windows))]
    #[test]
    fn is_hidden_file_detects_dot_prefix() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join(".hidden_file");
        fs::write(&file_path, "").unwrap();
        let metadata = file_path.symlink_metadata().unwrap();
        assert!(is_hidden_file(".hidden_file", &metadata));
    }

    #[cfg(not(windows))]
    #[test]
    fn is_hidden_file_normal_file_not_hidden() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("normal.txt");
        fs::write(&file_path, "").unwrap();
        let metadata = file_path.symlink_metadata().unwrap();
        assert!(!is_hidden_file("normal.txt", &metadata));
    }

    #[cfg(unix)]
    #[test]
    fn from_path_symlink() {
        let dir = tempfile::tempdir().unwrap();
        let target = dir.path().join("target.txt");
        fs::write(&target, "content").unwrap();
        let link = dir.path().join("link.txt");
        std::os::unix::fs::symlink(&target, &link).unwrap();

        let entry = FileEntry::from_path(&link).unwrap();
        assert!(entry.is_symlink);
        assert_eq!(entry.name, "link.txt");
        assert_eq!(entry.size, 7);
    }
}
