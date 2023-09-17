<script setup lang="ts">
// Scripts for the component
import { House } from '@element-plus/icons-vue';
import { createNewScene, resolveScenesFromFS } from '../../../scripts/story';
import { dialogStyling } from '../../../scripts/dialog.css'
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { ref, watch } from 'vue';
import { sanitizeFileName } from '../../../scripts/utils';

const props = defineProps({
  baseDir: String,
})

const isNewSceneDialogVisible = ref(false);
const newSceneType = ref(0);
const newSceneName = ref('');

let scenesList = ref(await resolveScenesFromFS(decodeURIComponent(props.baseDir as string)));

async function loadSceneFromFS() {
  scenesList.value = await resolveScenesFromFS(decodeURIComponent(props.baseDir as string));
}

async function executeAddNewScene() {
  isNewSceneDialogVisible.value = false;
  await createNewScene(props.baseDir as string, newSceneName.value.trim(), newSceneType.value);
  await loadSceneFromFS();
  newSceneName.value = '';
}

watch(newSceneName, () => {
  newSceneName.value = sanitizeFileName(newSceneName.value);
});
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="page-title">
      <h1>Select a scene</h1>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <el-scrollbar class="scenes-scrollarea">
      <div class="scenes-div">
        <button @click="isNewSceneDialogVisible = true" class="scene-entry add-scene-button">
          <div class="add-scene-button content">
            <div class="add-scene-button content text">
              <el-icon class="add-scene-button content icon">
                <CirclePlus />
              </el-icon>
              <p>Add a new scene</p>
            </div>
          </div>
        </button>
        <button v-for="scene in scenesList" style="position: relative;" class="scene-entry"
          @click="$router.push(`/sceneeditor/${encodeURIComponent(scene.scene_dir)}`)">
          <img class="scene-background img" v-if="scene.base_scene_info.media != null"
            :src="convertFileSrc(scene.base_scene_info.media)" />
          <div class="scene-background div" v-if="scene.base_scene_info.background_color != null"
            :style="`background-color: ${scene.base_scene_info.background_color}`"></div>
          <div class="scene-entry-preview-text">
            <h3 class="background-neutral-text">{{ scene.scene_name }}</h3>
            <div>
              <p class="background-neutral-text">{{ scene.base_scene_info.center_text }}</p>
              <p class="background-neutral-text">{{ scene.base_scene_info.narration_text }}</p>
            </div>
          </div>
        </button>
      </div>
    </el-scrollbar>
    <div class="bottom-text">
      <el-icon>
        <InfoFilled />
      </el-icon>
      <p>Select a scene to edit or add a new scene.</p>
    </div>
    <el-dialog :style="dialogStyling" v-model="isNewSceneDialogVisible" :show-close="false" width="80%" align-center>
      <template #header>
        <h2 class="dialog-center-title">New scene</h2>
      </template>
      <div class="new-scene-dialog-content">
        <el-form label-position="top">
          <el-form-item label="Name for your new scene">
            <el-input v-model="newSceneName" size="large" maxlength="69"
              placeholder="brand new scene for a brand new day" />
          </el-form-item>
          <el-form-item label="Choose a template to get started with">
            <el-radio-group v-model="newSceneType">
              <el-radio-button :label="0">
                <div class="scene-type-entry">
                  <div class="tmp-rect"></div>
                  <h3>Narration</h3>
                </div>
              </el-radio-button>
              <el-radio-button :label="1">
                <div class="scene-type-entry">
                  <div class="tmp-rect"></div>
                  <h3>Attention</h3>
                </div>
              </el-radio-button>
              <el-radio-button :label="2">
                <div class="scene-type-entry">
                  <div class="tmp-rect"></div>
                  <h3>Custom (blank)</h3>
                </div>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="new-scene-dialog-footer">
          <el-button @click="executeAddNewScene" :disabled="newSceneName.length <= 0" type="primary">Add</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.page-title {
  margin: 0 30px;
  margin-top: 30px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.add-scene-button {
  position: relative;
}

.add-scene-button.content {
  height: 100%;
}

.add-scene-button.content.text {
  position: relative;
  font-size: 20px;
  display: flex;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  text-align: center;
  gap: 20px;
  opacity: 0.5;
}

.add-scene-button.content.icon {
  font-size: 60px;
  margin: 0 auto;
  height: min-content;
}

.scenes-div {
  display: grid;
  gap: 30px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  grid-auto-rows: 240px;
  padding: 0 30px;
  padding-top: 5px;
  padding-bottom: 20px;
}

.scene-background {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
  border-radius: 18px;
}

.scene-background.img,
.scene-background.div {
  width: 100%;
  height: 100%;
}

.scene-background.img {
  object-fit: cover;
}

.scene-entry {
  padding: 20px;
  background-color: #77777733;
  border-radius: 20px;
  overflow: hidden;
  text-align: left;
  border: 2px solid #77777777;
  transition: 0.2s;
  transform-origin: bottom;
}

.scene-entry:hover {
  transform: scale(1.02);
  box-shadow: -1px 3px 5px #00000077;
}

.scene-entry:active {
  transform: unset;
  box-shadow: unset;
}

.scene-entry-preview-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.scene-entry-preview-text h3 {
  font-size: 22px;
}

.scene-entry-preview-text p {
  font-size: 16px;
}

.bottom-text {
  margin: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  opacity: 0.5;
  border-top: 1px solid #77777777;
  padding-top: 8px;
  margin-top: 0;
}

.new-scene-dialog-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.scene-type-entry {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 5px;
}

.new-scene-dialog-footer {
  display: flex;
  width: 100%;
  justify-content: center;
}

.new-scene-dialog-footer * {
  width: 150px;
}

.tmp-rect {
  width: 150px;
  height: 110px;
  background-color: #333333;
  border-radius: 5px;
}
</style>