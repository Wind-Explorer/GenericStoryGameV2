import { appDataDir } from '@tauri-apps/api/path';
import { FileEntry, readTextFile } from '@tauri-apps/api/fs';
import { getObjFromPath, ensurePathExists, joinPath, sanitizePath, filteredReadDir } from './utils';
import { sep } from "@tauri-apps/api/path";
import { strings } from './strings';

/**
 * Path to application data directory.
 */
export const appDataDirPath = await ensurePathExists(await appDataDir());

/**
 * Path to stories collection directory.
 * 
 * Resolves to `$APPDATA/collections`.
 */
export const collectionsPath = await ensurePathExists(joinPath(appDataDirPath, strings.fileNames.collectionsFolder));

/**
 * Path to story creator workspace directory.
 * 
 * Resolves to `$APPDATA/workspace`.
 */
export const workspacePath = await ensurePathExists(joinPath(appDataDirPath, strings.fileNames.workspaceFolder));

/**
 * Structure of story info.
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
 * Structure of scene actions from scene info.
 */
export interface SceneActions {
  multiple_choice: MultipleChoice[] | null;
  single_choice: string | null; // filepath
}

/**
 * Structure of multiple choice from scene actions.
 */
export interface MultipleChoice {
  action: string;
  destination: string;
}

/**
 * Structure of scene info.
 */
export interface SceneInfo {
  center_text: string | null;
  narration_text: string | null;
  background_color: string | null;
  media: string | null;
  scene_actions: SceneActions;
}

/**
 * Possible location of stories.
*/
export enum StoryLocation {
  Collections,
  Workspace,
}

/**
 * Possible types of scene text.
 */
export enum SceneTextType {
  Narration,
  Attention,
  None,
}

/**
 * Possible types of scene navigation.
 */
export enum SceneNavigationType {
  SingleChoice,
  MultipleChoice,
}

export enum SceneBackgroundType {
  Media,
  Color,
}

/**
 * Structure of story info
 * with extra information to be used in editor.
 */
export interface ExtraStoryInfo {
  base_story_info: StoryInfo;
  resources_count: number;
  scenes_count: number;
}

/**
 * Structure of scene info with extra information to be used in editor.
 */
export interface ExtraSceneInfo {
  base_scene_info: SceneInfo;
  scene_name: string;
  scene_path: string;
}

/**
 * Resolves story collection located on file system.
 * @param location Location of story collection.
 */
export async function resolveStoriesFromFS(location: StoryLocation = StoryLocation.Collections): Promise<StoryInfo[]> {
  // Read contents of application data directory.
  const collectionsDirContent =
    // Determine if reading from collections or workspace.
    location == StoryLocation.Collections ?
      await filteredReadDir(collectionsPath) :
      await filteredReadDir(workspacePath);

  // If application data directory is empty, return empty array.
  if (collectionsDirContent.length <= 0) { return []; }

  // Array to store story info.
  let storyInfos: StoryInfo[] = [];

  // Iterate over contents of application data directory.
  for (var entry in collectionsDirContent) {
    try {
      let baseDir = collectionsDirContent[entry].path;
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
 * Resolves scenes from a story save directory.
 * @param baseDir Path to story save directory.
 * @returns Array of `ExtraSceneInfo` objects.
 */
export async function resolveScenesFromFS(baseDir: string): Promise<ExtraSceneInfo[]> {
  return filteredReadDir(joinPath(baseDir, strings.fileNames.scenesFolder)).then(async (scenes) => {

    // TODO: If story save directory is empty, return empty array.

    // Array to store scene info.
    let sceneInfos: ExtraSceneInfo[] = [];
    for (var entry in scenes) {
      try {
        let scenePath = scenes[entry].path;
        let sceneInfo = await resolveSceneInfo(scenePath);

        // Create extra scene info object.
        let extraSceneInfo: ExtraSceneInfo = {
          base_scene_info: sceneInfo,

          // Get scene name from path, removing .json suffix.
          scene_name: getObjFromPath(scenePath).replace('.json', ''),
          scene_path: scenePath,
        }
        sceneInfos.push(extraSceneInfo);
      } catch {
        // Something silly happened. Skip this entry.
        continue;
      }
    }
    return sceneInfos;
  });
}

/**
 * Resolves story info from a story save directory.
 * @param baseDir Path to story save directory.
 */
export async function resolveStoryInfo(baseDir: string): Promise<StoryInfo> {

  // Read story info as JSON data from story save directory.
  let storyInfoAsJSON = await readTextFile(joinPath(baseDir, strings.fileNames.core));

  // Parse story info from JSON data.
  const storyInfo = JSON.parse(storyInfoAsJSON, (key, value) => {

    // If key is creation_date, parse value as Date object.
    if (key === 'creation_date') {
      return new Date(value);
    }

    // If key is thumbnail or entry_point, prepend base directory to value.
    else if (key === 'thumbnail' || key === 'entry_point') {
      return joinPath(baseDir, value);
    }

    // If key is base_dir, return base directory.
    else if (key === 'base_dir') {
      return sanitizePath(baseDir);
    }
    return value;
  }) as StoryInfo;
  return storyInfo;
}

/**
 * Resolves more story info from a story save directory for editing purposes.
 * @param baseDir Path to story save directory.
 * @returns `ExtraStoryInfo`
 */
export async function resolveExtraStoryInfo(baseDir: string): Promise<ExtraStoryInfo> {
  const baseStoryInfo = await resolveStoryInfo(baseDir);
  const resourcesCount = await filteredReadDir(joinPath(baseDir, strings.fileNames.resourcesFolder)).then((resources) => resources.length);
  const scenesCount = await filteredReadDir(joinPath(baseDir, strings.fileNames.scenesFolder)).then((scenes) => scenes.length);
  return {
    base_story_info: baseStoryInfo,
    resources_count: resourcesCount,
    scenes_count: scenesCount,
  } as ExtraStoryInfo;
}

/**
 * Prepares scene actions for use in scene info.
 * @param sceneAction Scene action to resolve.
 * @param baseDir Base directory pointing to the path of the story.
 */
function resolveSceneActions(sceneAction: SceneActions, baseDir: string): SceneActions {
  if (sceneAction.multiple_choice) {

    // Resolve multiple choice destinations by appending base dir to relative paths.
    sceneAction.multiple_choice = sceneAction.multiple_choice.map((multipleChoice: MultipleChoice) => {
      return {
        action: multipleChoice.action,
        destination: (() => {
          const value = multipleChoice.destination;

          // Before concatenating, check if it's null or is ending tag.
          if (value == null || value == strings.navigationKeywords.end) {
            return value;
          } else {
            return joinPath(baseDir, value);
          }
        })()
      };
    });
  }

  // Resolve single choice destination by appending base dir to relative path.
  sceneAction.single_choice = (() => {
    const value = sceneAction.single_choice;

    // Before concatenating, check if it's null or is ending tag.
    if (value == null || value == strings.navigationKeywords.end) {
      return value;
    } else {
      return joinPath(baseDir, value);
    }
  })();
  return sceneAction;
}

/**
 * Helper function to get story base directory path from scene JSON path.
 * @param scenePath Path to scene JSON file.
 */
export function resolveBaseDirFromScenePath(scenePath: string) {
  let splittedScenePath = sanitizePath(scenePath).split(sep);
  splittedScenePath.pop();
  splittedScenePath.pop();
  return splittedScenePath.join(sep);
}

/**
 * Resolves scene info from path to scene JSON data.
 * @param scenePath Absolute path to scene JSON file.
 */
export async function resolveSceneInfo(scenePath: string) {

  // Read scene info as JSON data from scene info JSON file.
  let sceneInfoAsJSON = await readTextFile(scenePath);
  let baseDir = resolveBaseDirFromScenePath(scenePath);

  // Parse scene info from JSON data.
  const sceneInfo = JSON.parse(sceneInfoAsJSON, (key, value) => {

    // If key is media, prepend base directory to value.
    if (key === 'media') {
      return value != null ? joinPath(baseDir, value) : null;
    }

    // If key is scene_actions, resolve scene actions.
    else if (key === 'scene_actions') {
      return resolveSceneActions(value, baseDir);
    }
    return value;
  }) as SceneInfo;
  return sceneInfo;
}

/**
 * Fetch available story resources found in story save.
 * @returns A list of available story resources.
 */
export async function resolveAvailableStoryResource(baseDir: string): Promise<FileEntry[]> {
  let availableResourcesFromSave = await filteredReadDir(joinPath(baseDir, strings.fileNames.resourcesFolder));
  return availableResourcesFromSave;
}

/**
 * Converts a scene name to a relative JSON file path.
 * @param sceneName Name of the scene to be converted.
 * @returns Converted relative path.
 */
export function sceneNameToRelativePath(sceneName: string): string {
  return sanitizePath(joinPath(strings.fileNames.scenesFolder, sceneName + '.json'), '/');
}