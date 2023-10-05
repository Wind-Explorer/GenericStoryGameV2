import router from "../router";
import { StoryInfo, StoryLocation, collectionsPath, resolveStoriesFromFS } from "./story";

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
  playbackStory(storyInfo: StoryInfo) {
    router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`);
  }
}
