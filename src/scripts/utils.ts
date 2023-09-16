import { invoke } from "@tauri-apps/api";
import { createDir, exists } from "@tauri-apps/api/fs";
import { sep } from "@tauri-apps/api/path";
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
  const pathArray = sanitizePath(path).split(sep);
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

/**
 * Normalize and remove duplicate path separators
 * @param path Path to be processed
 * @param separator Path separator - defaults to system path separator
 * @returns Processed path
 */
export function sanitizePath(path: string, separator: string = sep): string {
  const sanitizedPath: string[] = [];
  path.split(/[\\/]/).forEach(path => {
    if (path !== '') sanitizedPath.push(path);
  });
  const joinedPath = sanitizedPath.join(separator);
  return path.startsWith(separator) ? separator + joinedPath : joinedPath;
}

/**
 * Joins multiple strings together as system file path.
 * @param paths Paths to join.
 */
export function joinPath(...paths: string[]): string {
  paths.forEach(path => {
    if (path.endsWith(sep))
      path = path.slice(0, -1);
  });
  return sanitizePath(paths.join(sep));
}

/**
 * Converts an absolute path to a path relative to the story base directory.
 * @param fullPath Absolute path
 * @param baseDir Base directory
 * @returns Path relative to story base directory
 */
export function convertAbsoluteToRelative(fullPath: string, baseDir: string): string {
  // Separators for paths stored defaults to POSIX ('/')
  return sanitizePath(fullPath.replace(`${baseDir}${sep}`, ''), '/');
}