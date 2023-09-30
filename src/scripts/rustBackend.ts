import { invoke } from "@tauri-apps/api";

export class ArchiveManager {
  static compressFolder(folderPath: string, outputPath: string) {
    return invoke("compress_folder", { folderPath: folderPath, outputPath: outputPath });
  }

  static decompressArchive(archivePath: string, outputFolder: string) {
    return invoke("decompress_archive", { archivePath: archivePath, outputFolder: outputFolder });
  }
}

export class RustBackend {
  static archiveManager = ArchiveManager;

  static async resolveCurrentOS(): Promise<string> {
    return await invoke('resolve_current_os');
  }
}
