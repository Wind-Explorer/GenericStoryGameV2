import { StoryInfo, SceneInfo } from "./story";

/**
 * Function that generates a random hex color code.
 * @returns `string`
 */
function getRandomColor(): string {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
}

/**
 * Template story info.
 * @returns `StoryInfo`
 */
export function templateStoryInfo(story_title: string, story_description: string, story_author: string): StoryInfo {
  return {
    title: story_title,
    description: story_description.length <= 0 ? 'An exciting generic story.' : story_description,
    author: story_author.length <= 0 ? 'A mysterious someone' : story_author,
    creation_date: new Date(),
    thumbnail: 'resources/thumb.heic',
    entry_point: 'scenes/First Scene.json',
    base_dir: ''
  }
}

/**
 * First template scene info.
 */
export const templateSceneInfo1: SceneInfo = {
  center_text: "This is the first scene of the story. It's a very exciting scene.",
  narration_text: null,
  background_color: getRandomColor(),
  media: null,
  scene_actions: {
    multiple_choice: null,
    single_choice: "scenes/Second Scene.json",
  }
}

/**
 * Second template scene info.
 */
export const templateSceneInfo2: SceneInfo = {
  center_text: null,
  narration_text: "Welcome to the second and the last scene! Open up the editor and start creating your own story!",
  background_color: getRandomColor(),
  media: null,
  scene_actions: {
    multiple_choice: [
      {
        action: "Go to the first scene",
        destination: "scenes/First Scene.json"
      },
      {
        action: "End the story now",
        destination: "#END"
      }
    ],
    single_choice: null,
  }
}