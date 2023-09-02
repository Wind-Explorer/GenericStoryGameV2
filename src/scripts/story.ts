import { appDataDir } from '@tauri-apps/api/path';
import { createDir, exists, readDir, readTextFile } from '@tauri-apps/api/fs';

// Path to application data directory.
const appDataDirPath = await appDataDir();

/**
 * Interface which defines structure of story info.
 */
export interface StoryInfo {
  title: string;
  description: string;
  author: string;
  creation_date: Date;
  thumbnail: string;
  entry_point: string;
  base_dir: string;
}

/**
 * Interface which defines structure of scene actions from scene info.
 */
export interface SceneActions {
  multiple_choice: MultipleChoice[] | null;
  single_choice: string | null;
}

/**
 * Interface which defines structure of multiple choice from scene actions.
 */
export interface MultipleChoice {
  action: string;
  destination: string;
}

/**
 * Interface which defines structure of scene info.
 */
export interface SceneInfo {
  center_text: string | null;
  narration_text: string | null;
  background_color: string | null;
  media: string | null;
  scene_actions: SceneActions;
}

/**
 * Function that resolves story collection located on file system.
 */
export async function resolveStoryCollection(): Promise<StoryInfo[]> {
  // If application data directory does not exist, create it.
  if (!await exists(appDataDirPath)) {
    createDir(appDataDirPath);
  }

  // Read contents of application data directory.
  const appDataDirContent = await readDir(appDataDirPath);

  // If application data directory is empty, return empty array.
  if (appDataDirContent.length <= 0) { return []; }

  // Array to store story info.
  let storyInfos: StoryInfo[] = [];

  // Iterate over contents of application data directory.
  for (var entry in appDataDirContent) {
    try {
      let baseDir = appDataDirContent[entry].path;
      let storyInfo = await resolveStoryInfo(baseDir);
      storyInfos.push(storyInfo);
    } catch {
      // Something silly happened. Skip this entry.
      continue;
    }
  }
  return storyInfos;
}

/**
 * Function that resolves story info from a story save directory.
 */
export async function resolveStoryInfo(baseDir: string): Promise<StoryInfo> {

  // Read story info as JSON data from story save directory.
  let storyInfoAsJSON = await readTextFile(`${baseDir}/gsg.json`);

  // Parse story info from JSON data.
  const storyInfo = JSON.parse(storyInfoAsJSON, (key, value) => {

    // If key is creation_date, parse value as Date object.
    if (key === 'creation_date') {
      return new Date(value);
    }

    // If key is thumbnail or entry_point, prepend base directory to value.
    else if (key === 'thumbnail' || key === 'entry_point') {
      return `${baseDir}/${value}`;
    }

    // If key is base_dir, return base directory.
    else if (key === 'base_dir') {
      return baseDir;
    }
    return value;
  }) as StoryInfo;
  return storyInfo;
}

/**
 * Function that resolves scene actions for use in scene info.
 */
function resolveSceneActions(sceneAction: SceneActions, baseDir: string): SceneActions {
  if (sceneAction.multiple_choice) {

    // Resolve multiple choice destinations by appending base dir to relative paths.
    sceneAction.multiple_choice = sceneAction.multiple_choice.map((multipleChoice: MultipleChoice) => {
      return {
        action: multipleChoice.action,
        destination: `${baseDir}/${multipleChoice.destination}`
      };
    });
  }

  // Resolve single choice destination by appending base dir to relative path.
  if (sceneAction.single_choice && sceneAction.single_choice != "#END") {
    sceneAction.single_choice = `${baseDir}/${sceneAction.single_choice}`;
  }
  return sceneAction;
}

/**
 * Function that resolves scene info from path to scene JSON data.
 */
export async function resolveSceneInfo(scenePath: string, baseDir: string) {

  // Read scene info as JSON data from scene info JSON file.
  let sceneInfoAsJSON = await readTextFile(scenePath);

  // Parse scene info from JSON data.
  const sceneInfo = JSON.parse(sceneInfoAsJSON, (key, value) => {

    // If key is media, prepend base directory to value.
    if (key === 'media') {
      return `${baseDir}/${value}`;
    }

    // If key is scene_actions, resolve scene actions.
    else if (key === 'scene_actions') {
      return resolveSceneActions(value, baseDir);
    }
    return value;
  }) as SceneInfo;
  return sceneInfo;
}