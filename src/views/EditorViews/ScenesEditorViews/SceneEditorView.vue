<script setup lang="ts">
import { House, Plus, Select, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { SceneEditor } from '../../../scripts/sceneEditor';
import { resolveSceneInfo, SceneTextType, SceneNavigationType, SceneBackgroundType, resolveBaseDirFromScenePath } from '../../../scripts/story';
import { getObjFromPath, getRandomColor, sanitizePath } from '../../../scripts/utils';
import { ref, watch } from 'vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';

// Scripts for the component

const props = defineProps({
  sceneDir: String,
})

const sceneDir = sanitizePath(props.sceneDir as string);

const sceneEditorData = ref<SceneEditor>(
  new SceneEditor(
    await resolveSceneInfo(sceneDir),
    sceneDir,
    resolveBaseDirFromScenePath(sceneDir)
  )
);

const sceneBackgroundColor = ref(sceneEditorData.value.scene.background_color ?? getRandomColor());

// When background color changes, update the value in the class.
watch(sceneBackgroundColor, async () => {
  sceneEditorData.value.setBackgroundColor(sceneBackgroundColor.value);
  console.log(sceneEditorData.value.scene.background_color);
});

watch(sceneEditorData.value, () => {
  console.log('something changed!!!');
});

function saveChanges() {
  sceneEditorData.value.saveSceneToDisk();
  ElMessage({ message: 'Saved', grouping: true, type: 'success' })
}
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="row-grid grid1">
      <el-card class="scene-preferences">
        <div class="scene-preferences-div">
          <el-scrollbar>
            <el-form label-position="top">
              <el-form-item label="Scene name">
                <el-input readonly :model-value="getObjFromPath(sceneDir)" />
              </el-form-item>
              <el-divider />
              <el-form-item label="Background type">
                <el-radio-group v-model="sceneEditorData.sceneBackgroundType">
                  <el-radio :label="SceneBackgroundType.Color">Color</el-radio>
                  <el-radio :label="SceneBackgroundType.Media">Media</el-radio>
                </el-radio-group>
                <div class="background-type-values">
                  <div v-if="sceneEditorData.sceneBackgroundType === SceneBackgroundType.Color"
                    class="background-type-values color-picker">
                    <el-input readonly v-model="sceneBackgroundColor" />
                    <el-color-picker v-model="sceneBackgroundColor" />
                  </div>
                  <el-button v-if="sceneEditorData.sceneBackgroundType === SceneBackgroundType.Media"
                    class="background-type-values media-picker">Change</el-button>
                </div>
              </el-form-item>
              <el-divider />
              <el-form-item label="Navigation type">
                <el-radio-group v-model="sceneEditorData.sceneNavigationType">
                  <el-radio :label="SceneNavigationType.SingleChoice">Single</el-radio>
                  <el-radio :label="SceneNavigationType.MultipleChoice">Multi</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-divider />
              <el-form-item label="Text display">
                <el-radio-group v-model="sceneEditorData.sceneTextType">
                  <el-radio :label="SceneTextType.Narration">Narration</el-radio>
                  <el-radio :label="SceneTextType.Attention">Attention</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-scrollbar>
          <div class="scene-preferences-actions">
            <el-button @click="saveChanges" type="success" plain :icon="Select">Save</el-button>
            <el-button @click="$router.go(-1)" plain :icon="House" style="width: min-content;" />
          </div>
        </div>
      </el-card>
      <div class="col-grid grid2">
        <div class="row-grid">
          <div id="scene-preview" class="component">
            <div class="scene-preview-background" v-if="sceneEditorData.sceneBackgroundType === SceneBackgroundType.Color"
              :style="`background-color: ${sceneBackgroundColor};`"></div>
            <el-image class="scene-preview-background" fit="cover"
              v-if="sceneEditorData.sceneBackgroundType === SceneBackgroundType.Media"
              :src="sceneEditorData.scene.media != null ? convertFileSrc(sceneEditorData.scene.media) : ''">
              <template #error>
                <div class="failed-to-load-image-message">
                  <el-icon>
                    <Warning />
                  </el-icon>
                  <el-text size="large" truncated>Did you add an image for display? Either that or something is very
                    wrong.</el-text>
                </div>
              </template>
            </el-image>
            <p v-if="sceneEditorData.sceneTextType === SceneTextType.Narration" id="scene-preview-narration-text"
              class="background-neutral-text">
              {{ sceneEditorData.scene.narration_text }}
            </p>
            <p v-if="sceneEditorData.sceneTextType === SceneTextType.Attention" id="scene-preview-center-text"
              class="background-neutral-text">{{ sceneEditorData.scene.center_text }}</p>
            <div v-if="sceneEditorData.sceneNavigationType == SceneNavigationType.MultipleChoice" id="scene-preview-mcq">
              <div class="mcq-button" v-for="mcqEntry in sceneEditorData.scene.scene_actions.multiple_choice">
                <p class="background-neutral-text">{{ mcqEntry.action }}</p>
              </div>
            </div>
            <div v-if="sceneEditorData.sceneNavigationType == SceneNavigationType.SingleChoice" id="scene-preview-catc"
              class="background-neutral-text">
              <p>Click anywhere to continue</p>
            </div>
          </div>
        </div>
        <div>
          <el-input v-if="sceneEditorData.sceneTextType === SceneTextType.Narration"
            v-model="sceneEditorData.scene.narration_text" class="scene-textarea" id="narration-text" maxlength="300"
            type="textarea" resize="none" :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Narration Text (appears at the top right of the scene)"></el-input>
          <el-input v-if="sceneEditorData.sceneTextType === SceneTextType.Attention"
            v-model="sceneEditorData.scene.center_text" class="scene-textarea" id="center-text" type="textarea"
            resize="none" maxlength="200" :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Attention Text (appears at the center of the scene)"></el-input>
        </div>
      </div>
      <div v-if="sceneEditorData.sceneNavigationType === SceneNavigationType.MultipleChoice" class="mcq-edit component">
        <el-scrollbar>
          <div class="empty-mcq"
            v-if="sceneEditorData.scene.scene_actions.multiple_choice == null || sceneEditorData.scene.scene_actions.multiple_choice.length <= 0">
            <el-empty description="Click the button below to begin." />
          </div>
          <el-card v-if="sceneEditorData.scene.scene_actions.multiple_choice != null" class="mcq-edit-card"
            v-for="mcqEntry in sceneEditorData.scene.scene_actions.multiple_choice">
            <div class="mcq-edit-entry">
              <el-form label-position="top">
                <el-form-item label="Action">
                  <el-input v-model="mcqEntry.action" />
                </el-form-item>
                <el-form-item label="Destination">
                  <div style="display: flex; gap: 5px;">
                    <el-input readonly :model-value="getObjFromPath(mcqEntry.destination)" />
                    <el-button text type="primary">Change</el-button>
                  </div>
                </el-form-item>
              </el-form>
              <el-button @click="sceneEditorData.removeNavigationOption(mcqEntry)" type="danger" size="small" text
                class="remove-mcq-option-button">
                <el-icon>
                  <DeleteFilled />
                </el-icon>
              </el-button>
            </div>
          </el-card>
        </el-scrollbar>
        <div class="add-mcq-div">
          <el-button @click="sceneEditorData.addNewNavigationOption()" text bg :icon="Plus">New option</el-button>
        </div>
      </div>
      <el-card v-if="sceneEditorData.sceneNavigationType === SceneNavigationType.SingleChoice" class="mcq-edit component">
        <p>Single choice</p>
        <el-divider></el-divider>
        <el-form label-position="top">
          <el-form-item label="Destination">
            <div style="display: flex; gap: 5px;">
              <el-input readonly
                :model-value="getObjFromPath(sceneEditorData.scene.scene_actions.single_choice ?? 'No Destination')" />
              <el-button text type="primary">Change</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */

.container {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
}

.component {
  border: 1px solid #77777777;
  border-radius: 4px;
}

.col-grid {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.row-grid {
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 10px;
}

.grid2 {
  width: 100%;
}


.mcq-button {
  all: unset;
  font-size: 1.5vw;
  padding: 0.15vw 0.5vw;
  font-weight: 400;
  transition: 0.1s;
}

.mcq-edit-card {
  margin: 10px 10px 10px 10px;
}

.mcq-edit-entry {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mcq-edit-entry p {
  opacity: 0.7;
}

.add-mcq-div {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-top: 1px solid #77777733;
}

.add-mcq-div * {
  width: 100%;
}

.background-type-values {
  margin-top: 5px;
  width: 100%;
}

.background-type-values.color-picker {
  display: flex;
  gap: 10px;
}

.background-type-values.media-picker {
  width: 100%;
}

.scene-preferences-div {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* border: 1px solid red; */
  bottom: 20px;
  top: 20px;
  left: 20px;
  right: 20px;
}

.scene-preview-background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.scene-preferences {
  width: 30vw;
  max-width: 260px;
  min-width: 180px;
  position: relative;
}

.scene-preferences-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  border-top: 1px solid #77777733;
  padding-top: 15px;
}

.scene-preferences-actions * {
  width: 100%;
}

.mcq-edit {
  width: 30vw;
  max-width: 300px;
  min-width: 230px;
  display: flex;
  flex-direction: column;
}

.scene-textarea {
  font-size: 24px;
}

.empty-mcq {
  position: relative;
  transform: scale(0.8);
  margin-top: 20vh;
}

.failed-to-load-image-message {
  position: relative;
  background-color: #a5000033;
  padding: 10px;
  display: flex;
  flex-direction: row;
  font-size: 15px;
  gap: 8px;
}

.failed-to-load-image-message * {
  margin: auto 0;
  color: red;
}

.remove-mcq-option-button {
  position: absolute;
  right: -15px;
  top: -15px;
}

#scene-preview {
  width: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
}

#scene-preview-narration-text {
  position: absolute;
  font-size: 1.5vw;
  max-width: 30vw;
  font-weight: 600;
  margin: 2vw;
}

#scene-preview-center-text {
  position: relative;
  font-size: 4vw;
  font-weight: 600;
  width: 100%;
  max-width: 45vw;
  margin: auto 5vw;
  text-align: center;
}

#scene-preview-mcq {
  position: absolute;
  z-index: 10;
  text-align: right;
  display: flex;
  flex-direction: column;
  width: 100%;
  bottom: 1.5vw;
  right: 1.5vw;
  gap: 0.5vw;
}

#scene-preview-catc {
  position: absolute;
  bottom: 1.5vw;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.9vw;
  opacity: 0.8;
  font-weight: 300;
}
</style>