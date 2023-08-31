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
}

export async function getStoryInfo(): Promise<StoryInfo[]> {
  if (!await exists(appDataDirPath)) {
    createDir(appDataDirPath);
  }
  const appDataDirContent = await readDir(appDataDirPath);
  let storyInfos: StoryInfo[] = [];
  for (var entry in appDataDirContent) {
    try {
      let baseDir = appDataDirContent[entry].path;
      let storyInfoAsJSON = await readTextFile(`${baseDir}/gsg.json`);
      const storyInfo = JSON.parse(storyInfoAsJSON, (key, value) => {
        if (key === 'creation_date') {
          return new Date(value);
        } else if (key === 'thumbnail' || key === 'entry_point') {
          return `${baseDir}/${value}`;
        }
        return value;
      }) as StoryInfo;
      console.log(storyInfo.thumbnail);
      storyInfos.push(storyInfo);
    } catch {
      continue;
    }
  }
  return storyInfos;
}