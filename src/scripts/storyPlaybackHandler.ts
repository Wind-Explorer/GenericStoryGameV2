import router from "../router";
import { SceneInfo, StoryInfo, resolveSceneInfo } from "./story";
import { strings } from "./strings";

export class StoryPlaybackHandler {
  storyInfo: StoryInfo;
  currentScene: SceneInfo;
  constructor(storyInfo: StoryInfo, firstScene: SceneInfo) {
    this.storyInfo = storyInfo;
    this.currentScene = firstScene;
  }

  /**
   * Navigates to the scene at the given path.
   * @param scenePath Path to the scene to navigate to.
   */
  async navigateToScene(scenePath: string) {
    // Check if destination is the end.
    if (scenePath == strings.navigationKeywords.end) {
      // Router back to where user came from.
      router.go(-1);
      return;
    }

    this.currentScene = await resolveSceneInfo(scenePath);
  }
}
