import { invoke } from "@tauri-apps/api";

export class ArchiveManager {
  static async compressFolder(folderPath: string, outputPath: string): Promise<string> {
    await invoke("compress_folder", { folderPath: folderPath, outputPath: outputPath });
    return outputPath;
  }

  static async decompressArchive(archivePath: string, outputFolder: string): Promise<string> {
    await invoke("decompress_archive", { archivePath: archivePath, outputFolder: outputFolder });
    return outputFolder;
  }
}

export class RustBackend {
  static archiveManager = ArchiveManager;

  static async resolveCurrentOS(): Promise<string> {
    return await invoke('resolve_current_os');
  }
}
