import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDirPath, resolveStoryInfo } from "./story";
import { strings } from "./strings";
import { ensurePathExists, joinPath } from "./utils";

/**
 * Structure of consistent data stored by the app.
 */
export interface ConsistentData {
  lastOpenedStoryPath: string | null;
  savedScenes: {
    storyPath: string;
    scene: string;
  }[] | null;
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
   * Updates the value of the story last played by the user.
   * @param lastPlayedStoryDir Path to the last played story.
   */
  static async updateLastPlayed(lastPlayedStoryDir: string | null) {
    const newConsistentData = await this.safeResolveConsistentData();
    newConsistentData.lastOpenedStoryPath = lastPlayedStoryDir;
    await writeTextFile(consistentDataPath, JSON.stringify(newConsistentData));
  }
}
