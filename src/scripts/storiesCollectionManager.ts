import router from "../router";
import { ConsistentDataManager } from "./conststentDataManager";
import { StoryInfo, StoryLocation, collectionsPath, resolveStoriesFromFS } from "./story";

/**
 * Manage stories in the story collections.
 */
export class storiesCollectionManager {
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

  /**
   * Playback the specified story.
   * @param storyInfo Story to playback
   */
  async playbackStory(storyInfo: StoryInfo) {
    await ConsistentDataManager.updateLastPlayed(storyInfo.base_dir);
    router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`);
  }
}
