import { appDataDir } from '@tauri-apps/api/path';
import { createDir, exists, readDir, readTextFile } from '@tauri-apps/api/fs';

const appDataDirPath = await appDataDir();

export interface StoryInfo {
  title: string;
  description: string;
  author: string;
  creation_date: Date;
  thumbnail: string;
  entry_point: string;
  base_dir: string;
}

export interface SceneActions {
  multiple_choice: MultipleChoice[] | null;
  single_choice: string | null;
}

export interface MultipleChoice {
  action: string;
  destination: string;
}

export interface SceneInfo {
  center_text: string | null;
  narration_text: string | null;
  background_color: string | null;
  media: string | null;
  scene_actions: SceneActions;
}

export async function resolveStoryCollection(): Promise<StoryInfo[]> {
  if (!await exists(appDataDirPath)) {
    createDir(appDataDirPath);
  }
  const appDataDirContent = await readDir(appDataDirPath);
  if (appDataDirContent.length <= 0) { return []; }
  let storyInfos: StoryInfo[] = [];
  for (var entry in appDataDirContent) {
    try {
      let baseDir = appDataDirContent[entry].path;
      let storyInfo = await resolveStoryInfo(baseDir);
      storyInfos.push(storyInfo);
    } catch {
      continue;
    }
  }
  return storyInfos;
}

export async function resolveStoryInfo(baseDir: string): Promise<StoryInfo> {
  let storyInfoAsJSON = await readTextFile(`${baseDir}/gsg.json`);
  const storyInfo = JSON.parse(storyInfoAsJSON, (key, value) => {
    if (key === 'creation_date') {
      return new Date(value);
    } else if (key === 'thumbnail' || key === 'entry_point') {
      return `${baseDir}/${value}`;
    } else if (key === 'base_dir') {
      return baseDir;
    }
    return value;
  }) as StoryInfo;
  return storyInfo;
}

function resolveSceneActions(sceneAction: SceneActions, baseDir: string): SceneActions {
  if (sceneAction.multiple_choice) {
    sceneAction.multiple_choice = sceneAction.multiple_choice.map((multipleChoice: MultipleChoice) => {
      return {
        action: multipleChoice.action,
        destination: `${baseDir}/${multipleChoice.destination}`
      };
    });
  }
  if (sceneAction.single_choice && sceneAction.single_choice != "#END") {
    sceneAction.single_choice = `${baseDir}/${sceneAction.single_choice}`;
  }
  return sceneAction;
}

export async function resolveSceneInfo(scenePath: string, baseDir: string) {
  let sceneInfoAsJSON = await readTextFile(scenePath);
  const sceneInfo = JSON.parse(sceneInfoAsJSON, (key, value) => {
    if (key === 'media') {
      return `${baseDir}/${value}`;
    } else if (key === 'scene_actions') {
      return resolveSceneActions(value, baseDir);
    }
    return value;
  }) as SceneInfo;
  return sceneInfo;
}