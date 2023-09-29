import { StoryInfo, StoryLocation } from "./story";

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
  static exportStory(storyInfo: StoryInfo, destinationDir: string) {
    console.log(`Export ${storyInfo.base_dir} to ${destinationDir}`);
  }

  // TODO: Implement
  static importStory(sourceDir: string, destination: StoryLocation) {
    console.log(`Import ${sourceDir} to ${destination}`);
  }
}
