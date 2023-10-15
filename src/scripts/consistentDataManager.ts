import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { StoryInfo, appDataDirPath, resolveStoryInfo } from "./story";
import { strings } from "./strings";
import { ensurePathExists, joinPath } from "./utils";

/**
 * Structure of consistent data stored by the app.
 */
export interface ConsistentData {
  lastOpenedStoryPath: string | null;
  savedScenes: SavedScene[] | null;
}

export interface SavedScene {
  storyPath: string;
  scene: string;
}

const emptyConsistentData: ConsistentData = {
  lastOpenedStoryPath: null,
  savedScenes: null
}

/**
 * Path to consistent data file.
 * 
 * Resolves to `$APPDATA/consistent.json`.
 */
export const consistentDataPath = await ensurePathExists(joinPath(appDataDirPath, strings.fileNames.consistentData), false);

/**
 * Manage consistent data of the app.
 */
export class ConsistentDataManager {

  /**
   * Initializes consistent data with emptiness.
   */
  static async initializeConsistentData(): Promise<ConsistentData> {
    await writeTextFile(consistentDataPath, JSON.stringify(emptyConsistentData));
    return emptyConsistentData;
  }

  /**
   * Resolve consistent data of the app.
   * @returns Consistent Data Object
   */
  static async resolveConsistentData(): Promise<ConsistentData> {
    return JSON.parse(await readTextFile(consistentDataPath)) as ConsistentData;
  }

  /**
   * Tries to resolve consistent data and reset
   * the consistent data if found to be invalid.
   * @returns Consistent Data Object
   */
  static async safeResolveConsistentData(): Promise<ConsistentData> {
    // Attempt to load the consistent data from the file system
    try {
      // Resolve consistent data
      const e: ConsistentData = await this.resolveConsistentData();

      // Check if the data is valid
      if (e.lastOpenedStoryPath === undefined || e.savedScenes === undefined) {
        // If the data is invalid, throw an error
        throw new Error("Invalid consistent data found!");
      }

      // If the data is valid, return it
      return e;
    } catch {
      // If the data could not be resolved, initialize it and return it
      return await this.initializeConsistentData();
    }
  }

  /**
   * Determines whether user has any last played story to continue from.
   * @returns `boolean`
   */
  static async continuable(): Promise<boolean> {
    const lastOpenedStoryPath = (await this.safeResolveConsistentData()).lastOpenedStoryPath;
    const result = lastOpenedStoryPath != null && exists(lastOpenedStoryPath);
    if (!result) {
      await this.updateLastPlayed(null);
    }
    return result;
  }

  /**
   * Resolves the name of the last played story.
   * @returns `string` or `null`
   */
  static async continuableStoryName(): Promise<string | null> {
    if (!this.continuable()) { return null }
    const consistentData = await this.safeResolveConsistentData();
    if (consistentData.lastOpenedStoryPath!.length <= 0) {
      return null;
    } else {
      return (await resolveStoryInfo(consistentData.lastOpenedStoryPath!)).title;
    }
  }

  /**
   * Writes new consistent data into disk.
   * @param newConsistentData New consistent data
   */
  static async updateConsistentData(newConsistentData: ConsistentData) {
    await writeTextFile(consistentDataPath, JSON.stringify(newConsistentData));
  }

  /**
   * Updates the value of the story last played by the user.
   * @param lastPlayedStoryDir Path to the last played story.
   */
  static async updateLastPlayed(lastPlayedStoryDir: string | null) {
    const newConsistentData = await this.safeResolveConsistentData();
    newConsistentData.lastOpenedStoryPath = lastPlayedStoryDir;
    await this.updateConsistentData(newConsistentData);
  }

  /**
   * Updates the value of the progress of the user for a story.
   * @param storyPath
   * @param scene 
   */
  static async updateUserStoryProgress(sceneToSave: SavedScene) {
    // Load the current consistent data
    const newConsistentData = await this.safeResolveConsistentData();

    // Create a new savedScenes array if there isn't one already
    if (newConsistentData.savedScenes === null) {
      newConsistentData.savedScenes = [];
    }

    // Update the saved scene for the current story
    let storyFound = false;
    for (const e of newConsistentData.savedScenes) {
      if (e.storyPath === sceneToSave.storyPath) {
        e.scene = sceneToSave.scene;
        storyFound = true;
        break;
      }
    }
    if (!storyFound) {
      // If the story was not found, add it to the saved scenes
      newConsistentData.savedScenes.push({
        storyPath: sceneToSave.storyPath,
        scene: sceneToSave.scene,
      })
    }

    // Save the updated consistent data
    await this.updateConsistentData(newConsistentData);
  }

  /**
   * Determines whether the specified story has saved progress.
   * @param storyInfo Story to look for
   * @returns `Promise<boolean>`
   */
  static async storyHasProgress(storyInfo: StoryInfo): Promise<boolean> {
    return await this.storyProgress(storyInfo) !== null;
  }

  /**
   * Resolves the saved progress of the specified story.
   * @param storyInfo Story to look for
   * @returns Saved scene information or null if not found
   */
  static async storyProgress(storyInfo: StoryInfo): Promise<SavedScene | null> {
    // Load the current consistent data
    const newConsistentData = await this.safeResolveConsistentData();

    // Create a new savedScenes array if there isn't one already
    if (newConsistentData.savedScenes === null) {
      newConsistentData.savedScenes = [];
    }

    for (const e of newConsistentData.savedScenes) {
      // Iterate through the saved progress
      if (e.storyPath === storyInfo.base_dir && e.scene !== null) {

        // If the story progress is the entry point, return null
        if (e.scene === storyInfo.entry_point) { return null }

        // If the specified story has been found, return it
        return e;
      }
    }

    // Progress save is not found. Return null
    return null;
  }
}
