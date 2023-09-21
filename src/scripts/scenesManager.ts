import { removeFile, renameFile, writeTextFile } from "@tauri-apps/api/fs";
import { ExtraSceneInfo, SceneInfo, resolveScenesFromFS, sceneNameToRelativePath } from "./story";
import { joinPath, resolveNewPathFromNewName } from "./utils";
import { getRandomColor } from "./utils";
import { templateAttentionSceneInfo, templateBlankSceneInfo, templateNarrationSceneInfo } from "./templateStoryData";

export class ScenesManager {
  scenesList: ExtraSceneInfo[]; // Array of scenes info
  baseDir: string; // Base directory of the story
  constructor(scenesList: ExtraSceneInfo[], baseDir: string) {
    this.baseDir = baseDir;
    this.scenesList = scenesList
  }


  async loadScenesFromFS() {
    this.scenesList = await resolveScenesFromFS(this.baseDir);
  }

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

  renameScene(sceneIndex: number, newName: string) {
    const oldScenePath = this.scenesList[sceneIndex].scene_path;
    renameFile(oldScenePath, resolveNewPathFromNewName(oldScenePath, newName))
      .catch((error) => {
        throw new Error('Failed to rename scene: ' + error);
      });
    this.loadScenesFromFS();
  }

  removeScene(sceneIndex: number) {
    removeFile(this.scenesList[sceneIndex].scene_path)
    this.loadScenesFromFS();
  }

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
}
