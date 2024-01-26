import { removeFile, renameFile, writeTextFile } from "@tauri-apps/api/fs";
import { ExtraSceneInfo, SceneInfo, resolveScenesFromFS, sceneNameToRelativePath } from "./story";
import { joinPath, resolveNewPathFromNewName } from "./utils";
import { getRandomColor } from "./utils";
import { templateAttentionSceneInfo, templateBlankSceneInfo, templateNarrationSceneInfo } from "./templateStoryData";

/**
 * An instance of scene manager offering interfaces to manage scenes.
 */
export class ScenesManager {
  scenesList: ExtraSceneInfo[]; // Array of scenes info
  baseDir: string; // Base directory of the story

  constructor(scenesList: ExtraSceneInfo[], baseDir: string) {
    this.baseDir = baseDir;
    this.scenesList = scenesList
  }

  /**
   * Populate the scenes list from scenes resolved from the file system.
   */
  async loadScenesFromFS() {
    this.scenesList = await resolveScenesFromFS(this.baseDir);
  }

  /**
   * Resolves the scene type template for use to create a new scene.
   * @param index Number representing the scene type.
   * @returns SceneInfo object representing the scene type.
   */
  resolveTemplateSceneType(index: number): SceneInfo {
    switch (index) {
      case 0:
        return templateNarrationSceneInfo;
      case 1:
        return templateAttentionSceneInfo;
      case 2:
        return templateBlankSceneInfo;
      default:
        return templateBlankSceneInfo;
    }
  }

  /**
   * Checks whether a scene already exists in the scenes list.
   * @param name Name of the scene to be checked.
   * @returns boolean representing whether the scene exists.
   */
  sceneExists(name: string): boolean {
    let nameAlreadyExists = false;
    this.scenesList.forEach(scene => {
      if (scene.scene_name !== name) {
        return;
      }
      nameAlreadyExists = true;
      return;
    });
    return nameAlreadyExists;
  }
  
  /**
   * Renames the selected scene in the scenes list.
   * @param sceneIndex The index of the scene in scenes list
   * @param newName New name given to the selected scene.
   */
  async renameScene(sceneIndex: number, newName: string) {
    const oldScenePath = this.scenesList[sceneIndex].scene_path;
    await (renameFile(oldScenePath, resolveNewPathFromNewName(oldScenePath, newName))
      .then(() => {
        this.loadScenesFromFS();
      })
      .catch((error) => {
        throw new Error('Failed to rename scene: ' + error);
      }));
  }

  /**
   * Removes the selected scene from the scenes list.
   * @param sceneIndex The index of the scene in scenes list
   */
  removeScene(sceneIndex: number) {
    removeFile(this.scenesList[sceneIndex].scene_path)
    this.loadScenesFromFS();
  }

  /**
   * Creates a new scene in the story.
   * @param sceneName Name of the new scene.
   * @param sceneTypeIndex The number representing the scene type.
   */
  async createScene(sceneName: string, sceneTypeIndex: number) {
    const sceneDir = joinPath(this.baseDir, sceneNameToRelativePath(sceneName));
    const backgroundColorHandler = (key: string, value: any) => {
      if (key === 'background_color') {
        return getRandomColor();
      }
      return value;
    };
    await writeTextFile(sceneDir, JSON.stringify(this.resolveTemplateSceneType(sceneTypeIndex), backgroundColorHandler));
    this.loadScenesFromFS();
  }

  /**
   * Saves the scenes list to the file system.
   */
  async saveScenesToFS() {
    await Promise.all(this.scenesList.map(scene => {
      let baseSceneInfo = scene.base_scene_info;
      let scenePath = scene.scene_path;

      if (baseSceneInfo.scene_actions.single_choice != null) {
        baseSceneInfo.scene_actions.single_choice = baseSceneInfo.scene_actions.single_choice.replace(this.baseDir + "/", "");
      } else if (baseSceneInfo.scene_actions.multiple_choice != null) {
        baseSceneInfo.scene_actions.multiple_choice = baseSceneInfo.scene_actions.multiple_choice.map((elem) => {
          const newDestination = elem.destination.replace(this.baseDir + "/", "");
          return { ...elem, destination: newDestination };
        });
      }

      if (!scene.scene_path.includes(this.baseDir + "/")) {
        scenePath = joinPath(this.baseDir, scene.scene_path);
      }
        
      return writeTextFile(scenePath, JSON.stringify(baseSceneInfo));
    }));
  }
}
