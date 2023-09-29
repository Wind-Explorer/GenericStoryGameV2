import { invoke } from "@tauri-apps/api";

export class RustBackend {
  static compressFolder(sourceDir: string, destinationDir: string, outputName: string) {
    return invoke("compress_folder", { folderPath: sourceDir, destinationPath: destinationDir, outputName });
  }

  static async resolveCurrentOS(): Promise<string> {
    return await invoke('resolve_current_os');
  }
}
