import { FileEntry, readDir, writeTextFile } from "@tauri-apps/api/fs";
import { ExtraStoryInfo, resolveScenesFromFS, sceneNameToRelativePath } from "./story";
import { convertAbsoluteToRelative, getObjFromPath, joinPath } from "./utils";
import { strings } from "./strings";

/**
 * A class that allows for editing of story info.
 */
export class StoryInfoEditor {
  baseDir: string;
  storyInfo: ExtraStoryInfo;
  storyResources: Promise<FileEntry[]>;
  constructor(storyInfo: ExtraStoryInfo) {
    this.baseDir = storyInfo.base_story_info.base_dir;
    this.storyInfo = storyInfo;
    this.storyResources = this.resolveStoryResources();
  }

  /**
   * Resolves available entry points from the filesystem.
   * @returns A list of available entry points.
   */
  async resolveAvailableEntryPointNames(): Promise<string[]> {
    return (await resolveScenesFromFS(this.baseDir as string)).map((scene) => {
      return scene.scene_name;
    })
  }

  /**
   * Sets the entry point of the story.
   * @param entryPoint The entry point to set.
   */
  setEntryPoint(entryPointName: string) {
    this.storyInfo.base_story_info.entry_point = sceneNameToRelativePath(entryPointName);
  }

  /**
   * Resolves the name of the entry point.
   * @returns The name of the entry point.
   */
  resolveEntryPointName(): string {
    return getObjFromPath(this.storyInfo.base_story_info.entry_point).replace('.json', '');
  }

  /**
 * Writes the updated story info into the filesystem.
 */
  async writeStoryInfoToDisk() {
    const JSONData = JSON.stringify(this.storyInfo.base_story_info, (key, value) => {

      // For thumbnail and entry_point paths, return path
      // relative to story directory (strip away absolute path).
      if (key === 'thumbnail' || key === 'entry_point') {
        return convertAbsoluteToRelative(value, this.baseDir);
      }

      // base_dir should be left empty.
      else if (key === 'base_dir') {
        return '';
      }
      else { return value };
    });

    // Write data to story core.
    await writeTextFile(joinPath(this.baseDir, strings.fileNames.core), JSONData);
  }

  /**
   * Resolves available resources from the filesystem.
   * @returns A list of available resources.
   */
  async resolveStoryResources(): Promise<FileEntry[]> {
    return await readDir(joinPath(this.baseDir, strings.fileNames.resourcesFolder));
  }

  /**
   * Resolves the thumbnail of the story.
   * @returns The thumbnail of the story.
   */
  resolveStoryThumbnail(): string {
    return this.storyInfo.base_story_info.thumbnail;
  }

  /**
   * Sets the thumbnail of the story.
   * @param newThumbnailName The name of the new thumbnail.
   */
  async setStoryThumbnail(newThumbnailName: string) {
    (await this.storyResources).forEach(resource => {
      if (resource.name === newThumbnailName) {
        this.storyInfo.base_story_info.thumbnail = resource.path;
      }
    });
  }
}
