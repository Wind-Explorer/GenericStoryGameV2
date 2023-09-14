import { SceneBackgroundType, SceneInfo, SceneNavigationType, SceneTextType } from "./story";

/**
 * An instance of scene editor offering interfaces to edit a scene.
 */
export class SceneEditor {
  scene: SceneInfo;
  sceneTextType: SceneTextType;
  sceneNavigationType: SceneNavigationType;
  sceneBackgroundType: SceneBackgroundType;
  constructor(scene: SceneInfo) {
    this.scene = scene;
    this.sceneTextType = this.resolveCurrentSceneTextType();
    this.sceneNavigationType = this.resolveCurrentSceneNavigationType();
    this.sceneBackgroundType = this.resolveCurrentSceneBackgroundType();
  }

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

  resolveCurrentSceneBackgroundType(): SceneBackgroundType {
    // Priorotizes image.
    if (this.scene.media != null) {
      return SceneBackgroundType.Media;
    } else {
      return SceneBackgroundType.Color;
    }
  }

  setCurrentTextType() {
    // Priorotizes attention / center text.
    if (this.scene.center_text != null) {
      this.scene.narration_text = null;
    } else if (this.scene.narration_text != null) {
      this.scene.center_text = null;
    } else {
      this.scene.center_text = "";
      this.scene.narration_text = null;
    }
  }

  saveSceneToDisk() {
    // Determine which of the available text type to use.
    // If more than one exists, preserve the priorotized type.
    this.setCurrentTextType();
  }

  /**
   * Sets the value of the background color property.
   * @param colorCode Hexadecimal color code to be set to.
   */
  setBackgroundColor(colorCode: string) {
    this.scene.background_color = colorCode;
  }
}