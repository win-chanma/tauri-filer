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

impl FileEntry {
    pub fn from_path(path: &std::path::Path) -> Option<Self> {
        let metadata = path.symlink_metadata().ok()?;
        let name = path.file_name()?.to_string_lossy().to_string();
        let is_hidden = name.starts_with('.');
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

fn guess_mime(name: &str) -> Option<String> {
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
