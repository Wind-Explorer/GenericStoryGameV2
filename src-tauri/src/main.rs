// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn resolve_current_os() -> String {
    #[cfg(target_os = "windows")]
    return "windows".to_string();
    #[cfg(target_os = "macos")]
    return "mac".to_string();
    #[cfg(target_os = "linux")]
    return "xdg".to_string();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![resolve_current_os])
        .on_window_event(|e| {
            if let tauri::WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1000));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
