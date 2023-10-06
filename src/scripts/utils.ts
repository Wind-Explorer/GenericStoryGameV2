import { FileEntry, FsDirOptions, createDir, exists, readDir } from "@tauri-apps/api/fs";
import { sep } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { RustBackend } from "./rustBackend";
import { v4 as uuidv4 } from 'uuid';

const currentOS = await RustBackend.resolveCurrentOS();

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
 * Ensures path passed in exists.
 * @param path Path to ensure exists.
 * @returns `Promise<string>` Path that was passed in.
 */
export async function ensureDirExists(path: string): Promise<string> {
  if (!await exists(path)) {
    createDir(path, { recursive: true });
  }
  return path;
}

/**
 * Opens the file manager in the specified directory.
 * @param dir Directory to open the file manager in.
 */
export async function openInFileManager(dir: string) {
  new Command(`file-manager-${currentOS}`, [dir]).execute();
}

/**
 * Resolves the name of the file manager for the current OS.
 * @returns Name of the file manager for the current OS.
 */
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
 * Generates a random hex color code.
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

/**
 * Sanitizes a file name by removing prohibited characters.
 * @param fileName File name to sanitize
*/
export function sanitizeFileName(fileName: string): string {
  const prohibitedChars = /[<>:"/\\|?*\x00-\x1F]/g; // regex for prohibited characters
  return fileName.replace(prohibitedChars, ''); // remove prohibited characters from the file name
}

/**
 * Finds the index of an element in an array.
 * @param element The element to search.
 * @param array The array to be searched
 * @returns The index of the element in the array. -1 if not found.
 */
export function findElementIndexFromArray(element: any, array: any[]): number {
  return array.findIndex((value, _, __) => {
    return value === element;
  });
}

/**
 * Generates a path with a new name from an old path with an old name.
 * 
 * Helper function for use with `renameFile()` from Tauri API.
 * @param filePath Path of old file
 * @param newName New name for the file
 * @returns Absolute path to the file with new name.
 */
export function resolveNewPathFromNewName(filePath: string, newName: string): string {
  const pathArray = filePath.split(sep);
  pathArray.pop();
  return joinPath(pathArray.join(sep), newName + '.json');
}

/**
 * Generates a new UUID.
 */
export function newUUID(): string {
  return window.isSecureContext ?
    self.crypto.randomUUID()
    : uuidv4();
}

/**
 * Same old `readDir()`, but filters out hidden files from a directory.
 * @param dir Directory to read from.
 * @param options Optional FS Dir options.
 */
export async function filteredReadDir(dir: string, options?: FsDirOptions | undefined): Promise<FileEntry[]> {
  const files = await readDir(dir, options);
  return files
    .filter((file) => file.name != null && !file.name.startsWith('.'))
    .map((file) => file);
}
