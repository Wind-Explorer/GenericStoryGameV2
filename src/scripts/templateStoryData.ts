import { StoryInfo, SceneInfo } from "./story";
import { strings } from "./strings";
import { getRandomColor } from "./utils";

/**
 * Template story info.
 * @returns `StoryInfo`
 */
export function templateStoryInfo(story_title: string, story_description: string, story_author: string): StoryInfo {
  return {
    title: story_title,
    description: story_description.length <= 0 ? strings.templateStoryInfo.description : story_description,
    author: story_author.length <= 0 ? strings.templateStoryInfo.author : story_author,
    creation_date: new Date(),
    thumbnail: `${strings.fileNames.resourcesFolder}/${strings.fileNames.thumbnail}`,
    entry_point: `${strings.fileNames.scenesFolder}/${strings.fileNames.firstScene}`,
    base_dir: ''
  }
}

/**
 * First template scene info.
 */
export const templateSceneInfo1: SceneInfo = {
  center_text: strings.templateSceneInfo.sceneText1,
  narration_text: null,
  background_color: getRandomColor(),
  media: null,
  scene_actions: {
    multiple_choice: null,
    single_choice: `${strings.fileNames.scenesFolder}/${strings.fileNames.secondScene}`,
  }
}

/**
 * Second template scene info.
 */
export const templateSceneInfo2: SceneInfo = {
  center_text: null,
  narration_text: strings.templateSceneInfo.sceneText2.text,
  background_color: getRandomColor(),
  media: null,
  scene_actions: {
    multiple_choice: [
      {
        action: strings.templateSceneInfo.sceneText2.sceneOption1,
        destination: `${strings.fileNames.scenesFolder}/${strings.fileNames.firstScene}`
      },
      {
        action: strings.templateSceneInfo.sceneText2.sceneOption2,
        destination: strings.navigationKeywords.end
      }
    ],
    single_choice: null,
  }
}

/**
 * Blank template scene info.
 */
export const templateBlankSceneInfo: SceneInfo = {
  center_text: '',
  narration_text: '',
  background_color: '#777777',
  media: null,
  scene_actions: {
    multiple_choice: [],
    single_choice: strings.navigationKeywords.end,
  }
}

/**
 * Template narration type scene info.
 */
export const templateNarrationSceneInfo: SceneInfo = {
  center_text: null,
  narration_text: strings.templateSceneInfo.narrationScene.text,
  background_color: '#777777',
  media: null,
  scene_actions: {
    multiple_choice: [
      {
        action: strings.templateSceneInfo.narrationScene.sceneOption1,
        destination: strings.navigationKeywords.end
      },
      {
        action: strings.templateSceneInfo.narrationScene.sceneOption2,
        destination: strings.navigationKeywords.end
      }
    ],
    single_choice: null,
  }
}

/**
 * Template attention type scene info.
 */
export const templateAttentionSceneInfo: SceneInfo = {
  center_text: strings.templateSceneInfo.attentionScene,
  narration_text: null,
  background_color: '#777777',
  media: null,
  scene_actions: {
    multiple_choice: null,
    single_choice: strings.navigationKeywords.end,
  }
}