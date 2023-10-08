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
      // Exit story.
      this.exitStory();
    }

    this.currentScene = await resolveSceneInfo(scenePath);
  }

  /**
   * Exit the story.
   */
  exitStory() {
    router.go(-1);
  }
}
