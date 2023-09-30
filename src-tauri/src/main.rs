// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod archive_manager;

#[tauri::command]
fn resolve_current_os() -> String {
    #[cfg(target_os = "windows")]
    return "windows".to_string();
    #[cfg(target_os = "macos")]
    return "mac".to_string();
    #[cfg(target_os = "linux")]
    return "xdg".to_string();
}

#[tauri::command]
fn compress_folder(folder_path: String, output_path: String) -> bool {
    match archive_manager::compress_folder(folder_path.as_str(), output_path.as_str()) {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

#[tauri::command]
fn decompress_archive(archive_path: String, output_folder: String) -> bool {
    match archive_manager::decompress_archive(archive_path.as_str(), output_folder.as_str()) {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resolve_current_os,
            compress_folder,
            decompress_archive
        ])
        .on_window_event(|e| {
            if let tauri::WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1000));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
