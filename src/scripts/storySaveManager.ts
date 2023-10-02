import { open, save } from "@tauri-apps/api/dialog";
import { StoryInfo, StoryLocation, collectionsPath, workspacePath } from "./story";
import { desktopDir, downloadDir } from "@tauri-apps/api/path";
import { strings } from "./strings";
import { RustBackend } from "./rustBackend";
import { joinPath, newUUID } from "./utils";
import { removeDir } from "@tauri-apps/api/fs";

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

  /**
   * Exports the story to a compressed archive.
   * @param storyInfo Story to export
   */
  static async exportStory(storyInfo: StoryInfo): Promise<boolean> {

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
      return false
    }

    // Compress the story directory into selected save directory
    await RustBackend.archiveManager.compressFolder(storyInfo.base_dir, saveDir);
    return true;
  }

  /**
   * Imports a story from a compressed archive.
   * @param destination Destination of the import
   */
  static async importStory(destination: StoryLocation): Promise<boolean> {

    // File to import the story from (selected by user)
    const storyDir = await open({
      title: "Select the story save file for importing",
      filters: [{
        name: strings.fileTypes.storySave.description,
        extensions: [strings.fileTypes.storySave.extension]
      }],
      defaultPath: await downloadDir(),
      directory: false,
      multiple: false
    });

    // If user cancels the open dialog, do nothing
    if (storyDir === null || Array.isArray(storyDir)) {
      return false;
    }

    // Determine the destination of the import
    let importDestination: string;
    if (destination === StoryLocation.Collections) {
      importDestination = collectionsPath;
    } else {
      importDestination = workspacePath;
    }

    // Decompress the story archive into the destination
    await RustBackend.archiveManager.decompressArchive(storyDir, joinPath(importDestination, newUUID()));
    return true;
  }

  /**
   * Deletes the specified story.
   * @param storyInfo Path to the base directory of the story.
   */
  static async deleteStory(storyInfo: StoryInfo) {
    await removeDir(storyInfo.base_dir, { recursive: true })
  }
}
