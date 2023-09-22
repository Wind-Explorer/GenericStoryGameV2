import { writeTextFile } from "@tauri-apps/api/fs";
import { MultipleChoice, SceneActions, SceneBackgroundType, SceneInfo, SceneNavigationType, SceneTextType } from "./story";
import { convertAbsoluteToRelative, findElementIndexFromArray, joinPath } from "./utils";
import { strings } from "./strings";

/**
 * An instance of scene editor offering interfaces to edit a scene.
 */
export class SceneEditor {
  scene: SceneInfo;
  sceneTextType: SceneTextType;
  sceneNavigationType: SceneNavigationType;
  sceneBackgroundType: SceneBackgroundType;
  sceneDir: string;
  baseDir: string;
  constructor(scene: SceneInfo, sceneDir: string, baseDir: string) {
    this.scene = scene;
    this.sceneTextType = this.resolveCurrentSceneTextType();
    this.sceneNavigationType = this.resolveCurrentSceneNavigationType();
    this.sceneBackgroundType = this.resolveCurrentSceneBackgroundType();
    this.sceneDir = sceneDir;
    this.baseDir = baseDir;
    this.preventNull();
  }

  /**
   * Prevents null values from being assigned to scene actions.
   */
  preventNull() {
    if (this.scene.scene_actions.multiple_choice == null) {
      this.scene.scene_actions.multiple_choice = [];
    }
    if (this.scene.scene_actions.single_choice == null) {
      this.scene.scene_actions.single_choice = '';
    }
  }

  /**
   * Resolves the current text type for the scene.
   * @returns The current text type for the scene.
   */
  resolveCurrentSceneTextType(): SceneTextType {
    // Priorotizes attention / center text.
    if (this.scene.center_text != null) {
      return SceneTextType.Attention;
    } else if (this.scene.narration_text != null) {
      return SceneTextType.Narration;
    } else {
      return SceneTextType.Narration;
    }
  }

  /**
   * Resolves the current navigation type of the scene.
   * @returns The current navigation type of the scene.
   */
  resolveCurrentSceneNavigationType(): SceneNavigationType {
    // Priorotizes multiple choice.
    if (this.scene.scene_actions.multiple_choice != null) {
      return SceneNavigationType.MultipleChoice;
    } else if (this.scene.scene_actions.single_choice != null) {
      return SceneNavigationType.SingleChoice;
    } else {
      return SceneNavigationType.MultipleChoice;
    }
  }

  /**
   * Resolves the current background type of the scene.
   * @returns The current background type of the scene.
   */
  resolveCurrentSceneBackgroundType(): SceneBackgroundType {
    // Priorotizes image.
    if (this.scene.media != null) {
      return SceneBackgroundType.Media;
    } else if (this.scene.background_color != null) {
      return SceneBackgroundType.Color;
    } else {
      return SceneBackgroundType.Media;
    }
  }

  /**
   * Sets the value of the current text type property.
   */
  setCurrentTextType() {
    if (this.sceneTextType === SceneTextType.Attention) {
      this.scene.narration_text = null;
    } else if (this.sceneTextType === SceneTextType.Narration) {
      this.scene.center_text = null;
    } else {
      this.scene.center_text = "";
      this.scene.narration_text = null;
    }
  }

  /**
   * Sets the value of the current navigation type property.
   */
  setCurrentNavigationType() {
    if (this.sceneNavigationType === SceneNavigationType.MultipleChoice) {
      this.scene.scene_actions.single_choice = null;
    } else if (this.sceneNavigationType === SceneNavigationType.SingleChoice) {
      this.scene.scene_actions.multiple_choice = null;
    }
  }

  /**
   * Sets the value of the current background type property.
   */
  setCurrentSceneBackgroundType() {
    if (this.sceneBackgroundType === SceneBackgroundType.Media) {
      this.scene.background_color = null;
    } else if (this.sceneBackgroundType === SceneBackgroundType.Color) {
      this.scene.media = null;
    }
  }

  /**
   * Sets the value of the current types property.
   */
  setTypes() {
    this.setCurrentTextType();
    this.setCurrentNavigationType();
    this.setCurrentSceneBackgroundType();
  }

  /**
   * Prepare scene action information for storage.
   * @param sceneActions Scene action information to be processed.
   * @returns Processed scene action information.
   */
  processSceneActions(sceneActions: SceneActions): SceneActions {

    // If MCQ is not null, process each entry.
    if (sceneActions.multiple_choice != null) {
      sceneActions.multiple_choice.forEach((value, _, __) => {
        // If the destination of this entry is the end, skip.
        if (value.destination === strings.navigationKeywords.end) { return }

        // Otherwise, convert the destination to relative path.
        value.destination = convertAbsoluteToRelative(value.destination, this.baseDir);
      });
    }

    // If SCQ is not null and not the end, convert to relative path.
    else if (sceneActions.single_choice != null) {
      if (sceneActions.single_choice !== strings.navigationKeywords.end) {
        sceneActions.single_choice = convertAbsoluteToRelative(sceneActions.single_choice, this.baseDir);
      } else {
        sceneActions.single_choice = sceneActions.single_choice;
      }
    }

    return sceneActions;
  }

  /**
   * Saves the scene to story save directory.
   */
  async saveSceneToDisk() {
    this.setTypes();
    console.log(this.scene.scene_actions.multiple_choice);
    let sceneJson = JSON.stringify(this.scene, (key, value) => {
      if (key === 'media' && value != null) {
        return convertAbsoluteToRelative(value, this.baseDir);
      } else if (key === 'scene_actions') {
        value = this.processSceneActions(value);
      }
      return value;
    });

    // Write to file.
    await writeTextFile(this.sceneDir, sceneJson);
  }

  /**
   * Sets the value of the background color property.
   * @param colorCode Hexadecimal color code to be set to.
   */
  setBackgroundColor(colorCode: string) {
    this.scene.background_color = colorCode;
  }

  /**
   * Initializes a new navigation entry.
   */
  addNewNavigationOption() {
    this.scene.scene_actions.multiple_choice?.push({
      action: 'New action',
      destination: strings.navigationKeywords.end
    });
  }

  /**
   * Removes specified navigation entry.
   * @param index The entry to be removed
   */
  removeNavigationOption(entry: MultipleChoice) {
    if (this.scene.scene_actions.multiple_choice == null) {
      return;
    }
    let index = findElementIndexFromArray(entry, this.scene.scene_actions.multiple_choice)
    this.scene.scene_actions.multiple_choice.splice(index, 1);
  }

  changeSingleOptionDestination(destinationName: string) {
    this.scene.scene_actions.single_choice = joinPath(strings.fileNames.scenesFolder, destinationName + '.json');
  }
}