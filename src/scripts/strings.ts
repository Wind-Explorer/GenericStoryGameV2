/**
 * Collection of strings referenced in the app.
 */
export const strings = {
  templateStoryInfo: {
    description: 'An exciting generic story.',
    author: 'A mysterious someone',
  },
  templateSceneInfo: {
    sceneText1: "This is the first scene of the story. It's a very exciting scene.",
    sceneText2: {
      text: "Welcome to the second and the last scene! Open up the editor and start creating your own story!",
      sceneOption1: "Go to the first scene",
      sceneOption2: "End the story now"
    },
    narrationScene: {
      text: "This is a narration scene with multiple navigation options. Players can decide which direction they want to take.",
      sceneOption1: "An action the player can take",
      sceneOption2: "Another new action for the player",
    },
    attentionScene: "An attention scene grabs the player's attention.",
  },
  fileNames: {
    core: 'gsg.json',
    thumbnail: 'thumb.jpg',
    resourcesFolder: 'resources',
    collectionsFolder: 'collections',
    workspaceFolder: 'workspace',
    scenesFolder: 'scenes',
    firstScene: 'First Scene.json',
    secondScene: 'Second Scene.json'
  },
  navigationKeywords: {
    end: '#END',
  }
}