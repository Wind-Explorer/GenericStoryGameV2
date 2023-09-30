import { save } from "@tauri-apps/api/dialog";
import { StoryInfo, StoryLocation } from "./story";
import { desktopDir } from "@tauri-apps/api/path";
import { strings } from "./strings";
import { RustBackend } from "./rustBackend";

/**
 * Story save manager for managing saves in collections and workspaces.
 * 
 * * Moves story back and fourth between collection and workspace
 * * Export stories from workspace for sharing with others
 * * Import stories into collections / workspace from other users
 */
export class StorySaveManager {

  // TODO: Implement
  static moveStory(storyInfo: StoryInfo, destination: StoryLocation) {
    console.log(`${storyInfo.base_dir} to ${destination}`);
  }

  // TODO: Implement
  static async exportStory(storyInfo: StoryInfo) {

    // Directory to export the story to (selected by user)
    const saveDir = await save({

      // defaults to desktop
      defaultPath: await desktopDir(),

      // defaults to Generic Story Game file format.
      filters: [{
        name: strings.fileTypes.storySave.description,
        extensions: [strings.fileTypes.storySave.extension]
      }]
    });

    // If user cancels the save dialog, do nothing
    if (saveDir === null) {
      return;
    }

    // Compress the story directory into selected save directory
    await RustBackend.archiveManager.compressFolder(storyInfo.base_dir, saveDir);
    return;
  }

  // TODO: Implement
  static importStory(sourceDir: string, destination: StoryLocation) {
    console.log(`Import ${sourceDir} to ${destination}`);
  }
}
