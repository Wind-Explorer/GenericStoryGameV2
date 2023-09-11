import { invoke } from "@tauri-apps/api";
import { createDir, exists } from "@tauri-apps/api/fs";
import { Command } from "@tauri-apps/api/shell";

const currentOS = await invoke('resolve_current_os') as any as string;

/**
 * Pause the execution for the specified amount of time.
 * @param ms 
 * @returns `Promise<void>`
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Takes an absolute path to an object and returns the name of the object
 * @param path Absolute path to a file / direcotry
 * @returns string The name of the file / direcotry
 */
export function getObjFromPath(path: string): string {
  const pathArray = path.split('/');
  return pathArray[pathArray.length - 1];
}

/**
 * Function that ensures path passed in exists.
 * @param path Path to ensure exists.
 * @returns `Promise<string>` Path that was passed in.
 */
export async function ensureDirExists(path: string): Promise<string> {
  if (!await exists(path)) {
    createDir(path, { recursive: true });
  }
  return path;
}

export async function openInFileManager(dir: string) {
  new Command(`file-manager-${currentOS}`, [dir]).execute();
}

export function resolveNameOfFileManager(): string {
  switch (currentOS) {
    case 'windows':
      return 'File Explorer';
    case 'mac':
      return 'Finder';
    default:
      return 'File Manager';
  }
}

/**
 * Function that generates a random hex color code.
 * @returns `string`
 */
export function getRandomColor(): string {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
}