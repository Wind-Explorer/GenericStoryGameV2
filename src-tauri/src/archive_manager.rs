use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use zip::write::FileOptions;
use zip::{CompressionMethod, ZipArchive, ZipWriter};

/// Adds a folder to a zip file
/// # Arguments
/// * `zip` - The zip file to add the folder to
/// * `root_path` - The root path of the folder to add
/// * `folder_path` - The path of the folder to add
/// # Returns
/// * `std::io::Result<()>` - The result of the operation
fn add_folder_to_zip(
    zip: &mut ZipWriter<File>,
    folder_path: &Path,
    base_path: &Path,
) -> zip::result::ZipResult<()> {
    for entry in folder_path.read_dir()? {
        let path = entry?.path();
        if path.is_dir() {
            add_folder_to_zip(zip, &path, base_path)?;
        } else {
            let relative_path = path.strip_prefix(base_path).unwrap();
            let options = FileOptions::default()
                .unix_permissions(0o755)
                .compression_method(CompressionMethod::Deflated)
                .compression_level(Some(9));
            let mut file = File::open(&path)?;
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)?;
            zip.start_file(relative_path.to_str().unwrap(), options)?;
            zip.write_all(&buffer)?;
        }
    }
    Ok(())
}

/// Compresses a folder into a zip file
/// # Arguments
/// * `source_folder_path` - The path to the folder to compress
/// * `output_path` - The path to the output zip file
/// # Returns
/// * `zip::result::ZipResult<()>` - The result of the operation
/// # Example
/// ```rs
/// let folder_path = "/Users/wind/Desktop";
/// let output_path = "/Users/wind/test.zip";
/// match compress_folder(folder_path, output_path) {
///     Ok(_) => println!("Success"),
///     Err(e) => println!("Error: {:?}", e),
/// }
/// ```
pub fn compress_folder(source_folder_path: &str, output_path: &str) -> zip::result::ZipResult<()> {
    let folder_path = Path::new(source_folder_path);
    let output_file = File::create(output_path)?;
    let mut zip = ZipWriter::new(output_file);

    add_folder_to_zip(&mut zip, folder_path, folder_path)?;

    zip.finish()?;
    Ok(())
}

/// Decompresses a zip file into a folder
/// # Arguments
/// * `archive_path` - The path to the zip file to decompress
/// * `output_folder` - The path to the output folder
/// # Returns
/// * `zip::result::ZipResult<()>` - The result of the operation
/// # Example
/// ```rs
/// let archive_path = "/Users/wind/test.zip";
/// let output_folder = "/Users/wind/test";
/// match decompress_archive(archive_path, output_folder) {
///     Ok(_) => println!("Success"),
///     Err(e) => println!("Error: {:?}", e),
/// }
/// ```
pub fn decompress_archive(archive_path: &str, output_folder: &str) -> zip::result::ZipResult<()> {
    let archive_file = File::open(archive_path)?;
    let mut archive = ZipArchive::new(archive_file)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let output_path = Path::new(output_folder).join(file.name());
        if file.is_dir() {
            std::fs::create_dir_all(&output_path)?;
        } else {
            if let Some(parent) = output_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            let mut output_file = File::create(&output_path)?;
            std::io::copy(&mut file, &mut output_file)?;
        }
    }

    Ok(())
}
