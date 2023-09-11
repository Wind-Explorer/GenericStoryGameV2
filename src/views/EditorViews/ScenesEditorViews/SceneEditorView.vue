<script setup lang="ts">
import { ref } from 'vue';
import { SceneInfo, resolveSceneInfo } from '../../../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { getObjFromPath } from '../../../scripts/utils';
import { House, Plus, Select } from '@element-plus/icons-vue';

// Scripts for the component

const props = defineProps({
  sceneDir: String,
})

const sceneName = ref(getObjFromPath(decodeURIComponent(props.sceneDir as string)).replace('.json', ''));

const sceneInfo = ref<SceneInfo>(
  await resolveSceneInfo(
    decodeURIComponent(props.sceneDir as string)
  )
);

const useImageAsBackground = ref(sceneInfo.value.background_color != null ? false : true);
const multiChoiceNavigation = ref(sceneInfo.value.scene_actions.multiple_choice != null ? true : false);
const narrationScene = ref(sceneInfo.value.narration_text != null ? true : false);

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
                <el-input readonly v-model="sceneName" />
              </el-form-item>
              <el-divider />
              <el-form-item label="Background type">
                <el-radio-group v-model="useImageAsBackground">
                  <el-radio :label="false">Color</el-radio>
                  <el-radio :label="true">Media</el-radio>
                </el-radio-group>
                <div class="background-type-values">
                  <div v-if="!useImageAsBackground" class="background-type-values color-picker">
                    <el-input readonly
                      :model-value="sceneInfo.background_color != null ? sceneInfo.background_color : 'Pick a color'" />
                    <el-color-picker v-model="(sceneInfo.background_color as string)" />
                  </div>
                  <el-button v-if="useImageAsBackground" class="background-type-values media-picker">Change</el-button>
                </div>
              </el-form-item>
              <el-divider />
              <el-form-item label="Navigation type">
                <el-radio-group v-model="multiChoiceNavigation">
                  <el-radio :label="false">Single</el-radio>
                  <el-radio :label="true">Multi</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-divider />
              <el-form-item label="Text display">
                <el-radio-group v-model="narrationScene">
                  <el-radio :label="true">Narration</el-radio>
                  <el-radio :label="false">Attention</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-scrollbar>
          <div class="scene-preferences-actions">
            <el-button type="success" plain :icon="Select">Save</el-button>
            <el-button @click="$router.go(-1)" plain :icon="House" style="width: min-content;" />
          </div>
        </div>
      </el-card>
      <div class="col-grid grid2">
        <div class="row-grid">
          <div id="scene-preview" class="component">
            <div class="scene-preview-background" v-if="sceneInfo.background_color != null"
              :style="`background-color: ${sceneInfo.background_color}`"></div>
            <img class="scene-preview-background" v-if="sceneInfo.media != null"
              :src="convertFileSrc(sceneInfo.media as string)" />
            <p v-if="narrationScene" id="scene-preview-narration-text" class="background-neutral-text">{{
              sceneInfo.narration_text }}</p>
            <p v-if="!narrationScene" id="scene-preview-center-text" class="background-neutral-text">{{
              sceneInfo.center_text }}</p>
            <div v-if="multiChoiceNavigation" id="scene-preview-mcq">
              <div class="mcq-button" v-for=" mcqEntry  in  sceneInfo.scene_actions.multiple_choice ">
                <p class="background-neutral-text">{{ mcqEntry.action }}</p>
              </div>
            </div>
            <div v-if="!multiChoiceNavigation" id="scene-preview-catc">
              <p>Click anywhere to continue</p>
            </div>
          </div>
        </div>
        <div>
          <el-input v-if="narrationScene" class="scene-textarea" id="narration-text" v-model="sceneInfo.narration_text"
            maxlength="300" type="textarea" resize="none" :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Narration Text (appears at the top right of the scene)"></el-input>
          <el-input v-if="!narrationScene" class="scene-textarea" id="center-text" v-model="sceneInfo.center_text"
            type="textarea" resize="none" maxlength="200" :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Attention Text (appears at the center of the scene)"></el-input>
        </div>
      </div>
      <div v-if="multiChoiceNavigation" class="mcq-edit component">
        <el-scrollbar>
          <div class="empty-mcq"
            v-if="sceneInfo.scene_actions.multiple_choice == null || sceneInfo.scene_actions.multiple_choice.length <= 0">
            <el-empty description="Click the button below to begin." />
          </div>
          <el-card class="mcq-edit-card" v-for="mcqEntry in sceneInfo.scene_actions.multiple_choice">
            <div class="mcq-edit-entry">
              <el-form label-position="top">
                <el-form-item label="Action">
                  <el-input v-model="mcqEntry.action" />
                </el-form-item>
                <el-form-item label="Destination">
                  <div style="display: flex; gap: 5px;">
                    <el-input readonly :model-value="getObjFromPath(mcqEntry.destination).replace('.json', '')" />
                    <el-button text type="primary">Change</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-scrollbar>
        <div class="add-mcq-div">
          <el-button text bg :icon="Plus">New option</el-button>
        </div>
      </div>
      <el-card v-if="!multiChoiceNavigation" class="mcq-edit component">
        <p>Single choice</p>
        <el-divider></el-divider>
        <el-form label-position="top">
          <el-form-item label="Destination">
            <div style="display: flex; gap: 5px;">
              <el-input readonly
                :model-value="getObjFromPath(sceneInfo.scene_actions.single_choice ?? '').replace('.json', '')" />
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
  object-fit: cover;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.scene-preferences {
  width: 30vw;
  max-width: 260px;
  min-width: 180px;
  height: 100%;
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
  text-shadow: 0px 0px 0.1vw rgba(0, 0, 0, 1), 0px 0px 0.3vw rgba(0, 0, 0, 0.5), 0px 0px 0.8vw rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  font-weight: 300;
}
</style>