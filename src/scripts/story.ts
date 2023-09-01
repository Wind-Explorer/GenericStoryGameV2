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

export async function getStoryInfoFromDisk(): Promise<StoryInfo[]> {
  if (!await exists(appDataDirPath)) {
    createDir(appDataDirPath);
  }
  const appDataDirContent = await readDir(appDataDirPath);
  if (appDataDirContent.length <= 0) { return []; }
  let storyInfos: StoryInfo[] = [];
  for (var entry in appDataDirContent) {
    try {
      let baseDir = appDataDirContent[entry].path;
      let storyInfo = await getStoryInfo(baseDir);
      storyInfos.push(storyInfo);
    } catch {
      continue;
    }
  }
  return storyInfos;
}

export async function getStoryInfo(baseDir: string): Promise<StoryInfo> {
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