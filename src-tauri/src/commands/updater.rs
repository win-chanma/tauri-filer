const UPDATE_ENDPOINT: &str =
    "https://github.com/win-chanma/tauri-filer/releases/latest/download/latest.json";

#[tauri::command]
pub fn check_update_version() -> Result<Option<String>, String> {
    let current =
        parse_semver(env!("CARGO_PKG_VERSION")).ok_or("Invalid current version")?;

    let resp = ureq::get(UPDATE_ENDPOINT)
        .call()
        .map_err(|e| format!("HTTP error: {}", e))?;

    let json: serde_json::Value = resp
        .into_json()
        .map_err(|e| format!("JSON error: {}", e))?;

    let remote_str = json["version"]
        .as_str()
        .ok_or("Missing version in response")?
        .trim_start_matches('v');

    let remote = parse_semver(remote_str).ok_or("Invalid remote version")?;

    if remote > current {
        Ok(Some(remote_str.to_string()))
    } else {
        Ok(None)
    }
}

fn parse_semver(s: &str) -> Option<(u64, u64, u64)> {
    let s = s.trim_start_matches('v');
    let mut parts = s.splitn(3, '.');
    Some((
        parts.next()?.parse().ok()?,
        parts.next()?.parse().ok()?,
        parts.next()?.split('-').next()?.parse().ok()?,
    ))
}
