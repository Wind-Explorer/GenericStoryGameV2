import { StoryInfo, StoryLocation, resolveStoriesFromFS, workspacePath } from './story';
import { v4 as uuidv4 } from 'uuid';
import { joinPath } from './utils';
import { strings } from './strings';
import { createDir, removeDir, writeBinaryFile, writeTextFile } from '@tauri-apps/api/fs';
import { templateSceneInfo1, templateSceneInfo2, templateStoryInfo } from './templateStoryData';
import { bookUint8Array } from './book.png';

/**
 * An instance of story creator offering interfaces to create and manipulate story.
 */
export class StoryCreator {
  workspacePath: string;
  storyInfos: StoryInfo[];
  constructor(storyInfo: StoryInfo[]) {
    this.workspacePath = workspacePath;
    this.storyInfos = storyInfo;
  }

  /**
   * Refreshes the story list of the story creator.
   */
  async refreshStoryInfos() {
    this.storyInfos = await resolveStoriesFromFS(StoryLocation.Workspace);
  }

  /**
   * Initializes a new story with template content.
   * @param story_title Title of the story.
   * @param story_description Description of the story.
   * @param story_author Author of the story.
   * @returns Path to the base directory of the story.
   */
  async createNewStory(story_title: string, story_description: string, story_author: string): Promise<string> {

    // Generates a new UUID for use as new story directory name
    let uuidDirName =
      window.isSecureContext ?
        self.crypto.randomUUID()
        : uuidv4();

    // Declare the paths for story directory
    const baseDir = joinPath(this.workspacePath, uuidDirName);
    const scenesDir = joinPath(baseDir, strings.fileNames.scenesFolder);
    const resourcesDir = joinPath(baseDir, strings.fileNames.resourcesFolder);

    // Create the directories
    /*
    `recursive` is set to true, so `baseDir` will
    also be created without explicitly instructing.
    */
    await createDir(scenesDir, { recursive: true });
    await createDir(resourcesDir, { recursive: true });

    // Create a new story info object with user's inputs
    let newStoryInfo: StoryInfo = templateStoryInfo(story_title, story_description, story_author);

    // Converts the story info object into JSON data
    let newStoryInfoAsJSON = JSON.stringify(newStoryInfo, null);

    // Write the story info JSON data to the story directory
    await writeTextFile(joinPath(baseDir, strings.fileNames.core), newStoryInfoAsJSON);

    // Generate template story thumbnail
    await writeBinaryFile(joinPath(resourcesDir, strings.fileNames.thumbnail), bookUint8Array());

    // Populate the story with two example scenes
    await writeTextFile(joinPath(scenesDir, strings.fileNames.firstScene), JSON.stringify(templateSceneInfo1, null));
    await writeTextFile(joinPath(scenesDir, strings.fileNames.secondScene), JSON.stringify(templateSceneInfo2, null));

    // Return the base directory to the story.
    return baseDir;
  }

  /**
   * Deletes a story from the workspace.
   * @param storyInfo Path to the base directory of the story.
   */
  async deleteStory(storyInfo: StoryInfo) {
    console.log(storyInfo.base_dir);
    await removeDir(storyInfo.base_dir, { recursive: true })
  }
}
