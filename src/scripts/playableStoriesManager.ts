import { StoryInfo, StoryLocation, collectionsPath, resolveStoriesFromFS } from "./story";

export class PlayableStoriesManager {
  collectionsPath: string;
  storyInfos: StoryInfo[];
  constructor(storyInfos: StoryInfo[]) {
    this.storyInfos = storyInfos;
    this.collectionsPath = collectionsPath;
  }

  /**
   * Refreshes the story list of the playable stories manager.
   */
  async refreshStoryInfo() {
    this.storyInfos = await resolveStoriesFromFS(StoryLocation.Collections);
  }
}
