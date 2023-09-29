// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::File,
    io::{Read, Write},
    path::{Path, PathBuf},
};

use zip::{write::FileOptions, ZipWriter};

#[tauri::command]
fn resolve_current_os() -> String {
    #[cfg(target_os = "windows")]
    return "windows".to_string();
    #[cfg(target_os = "macos")]
    return "mac".to_string();
    #[cfg(target_os = "linux")]
    return "xdg".to_string();
}

/// Compresses a folder into a zip file
/// # Arguments
/// * `dir` - The directory to compress
/// * `destination` - The destination directory
/// * `file_name` - The name of the zip file
#[tauri::command]
fn compress_folder(source_dir: String, destination_dir: String, output_name: String) {
    // Path to the folder to compress
    let source_dir_path = Path::new(source_dir.as_str());

    // Path to the output zip file
    let output_file_path = File::create(
        PathBuf::from(destination_dir)
            .join(PathBuf::from(output_name)
                .with_extension("zip")
    )).unwrap();

    // Create the zip file
    let mut zip = ZipWriter::new(output_file_path);
    add_folder_to_zip(&mut zip, &source_dir_path, &source_dir_path).unwrap();
}

/// Adds a folder to a zip file
/// # Arguments
/// * `zip` - The zip file to add the folder to
/// * `root_path` - The root path of the folder to add
/// * `folder_path` - The path of the folder to add
/// # Returns
/// * `std::io::Result<()>` - The result of the operation
fn add_folder_to_zip(
    zip: &mut ZipWriter<File>,
    root_path: &Path,
    folder_path: &Path,
) -> std::io::Result<()> {
    for entry in folder_path.read_dir()? {
        let path = entry?.path();
        if path.is_dir() {
            add_folder_to_zip(zip, root_path, &path)?;
        } else {
            let relative_path = path.strip_prefix(root_path).unwrap();
            let options =
                FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
            zip.start_file(relative_path.to_str().unwrap(), options)?;
            let mut file = File::open(&path)?;
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
        }
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resolve_current_os,
            compress_folder
        ])
        .on_window_event(|e| {
            if let tauri::WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1000));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
