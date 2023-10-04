<script setup lang="ts">
// Scripts for the component
import { Delete, EditPen, House, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { dialogStyling } from '../../../scripts/dialog.css'
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { ref, watch } from 'vue';
import { sanitizeFileName, findElementIndexFromArray } from '../../../scripts/utils';
import { ScenesManager } from '../../../scripts/scenesManager';
import { resolveScenesFromFS } from '../../../scripts/story';

const props = defineProps({
  baseDir: String,
})

const isNewSceneDialogVisible = ref(false);
const newSceneType = ref(0);
const newSceneName = ref('');

const baseDir = decodeURIComponent(props.baseDir as string);

const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

function sceneExistsErrMsg() { ElMessage({ message: 'A scene with that name already exists.', type: 'error' }) };

async function addScene() {
  isNewSceneDialogVisible.value = false;
  if (scenesManager.value.sceneExists(newSceneName.value)) {
    sceneExistsErrMsg();
    return;
  } else {
    scenesManager.value.createScene(newSceneName.value, newSceneType.value);
  }
  newSceneName.value = '';
}

function prepareDeleteScene(sceneIndex: number) {
  ElMessageBox.confirm(
    'This action is irreversable.',
    'Are you sure?',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      scenesManager.value.removeScene(sceneIndex);
    })
    .catch(() => {
      // silence.
    });
}

function renameScene(sceneIndex: number) {
  ElMessageBox.prompt(' ', 'Enter a new name for the scene', {
    confirmButtonText: 'Rename',
    cancelButtonText: 'Cancel',
    inputPlaceholder: scenesManager.value.scenesList[sceneIndex].scene_name,
    inputPattern: /^(?!.*[<>:"/\\|?*\x00-\x1F]).*$/,
    inputErrorMessage: 'Prohibited characters found in name',
  })
    .then(async ({ value }) => {
      const newName = sanitizeFileName(value);
      if (scenesManager.value.sceneExists(newName)) {
        sceneExistsErrMsg();
        return;
      } else {
        await scenesManager.value.renameScene(sceneIndex, newName);
      }
    })
    .catch(() => {
      // silence.
    });
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
        <button v-for="scene in scenesManager.scenesList" style="position: relative;" class="scene-entry">
          <div class="scene-entry-content" @click="$router.push(`/sceneeditor/${encodeURIComponent(scene.scene_path)}`)">
            <img class="scene-background img" v-if="scene.base_scene_info.media != null"
              :src="convertFileSrc(scene.base_scene_info.media)" />
            <div class="scene-background div" v-if="scene.base_scene_info.background_color != null"
              :style="`background-color: ${scene.base_scene_info.background_color}`"></div>
            <div class="scene-entry-preview-text">
              <h3 class="background-neutral-text scene-entry-preview-title">{{ scene.scene_name }}</h3>
              <div>
                <p class="background-neutral-text">{{ scene.base_scene_info.center_text }}</p>
                <p class="background-neutral-text">{{ scene.base_scene_info.narration_text }}</p>
              </div>
            </div>
          </div>
          <el-dropdown class="story-entry-dropdown" trigger="click">
            <el-icon>
              <More />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="renameScene(findElementIndexFromArray(scene, scenesManager.scenesList))">
                  <el-icon>
                    <EditPen />
                  </el-icon>
                  Rename
                </el-dropdown-item>
                <el-dropdown-item @click="prepareDeleteScene(findElementIndexFromArray(scene, scenesManager.scenesList))">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
          <el-form-item :required="true" label="Name for your new scene">
            <el-input v-model="newSceneName" size="large" maxlength="69"
              placeholder="brand new scene for a brand new day" />
          </el-form-item>
          <el-form-item label="Choose a template to get started with">
            <el-radio-group v-model="newSceneType">
              <el-radio-button :label="0">
                <div class="scene-type-entry">
                  <img class="illust-rect" src="../../../assets/Narration.svg" />
                  <h3>Narration</h3>
                </div>
              </el-radio-button>
              <el-radio-button :label="1">
                <div class="scene-type-entry">
                  <img class="illust-rect" src="../../../assets/Attention.svg" />
                  <h3>Attention</h3>
                </div>
              </el-radio-button>
              <el-radio-button :label="2">
                <div class="scene-type-entry">
                  <img class="illust-rect" src="../../../assets/Blank.svg" />
                  <h3>Custom (blank)</h3>
                </div>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="new-scene-dialog-footer">
          <el-button @click="addScene" :disabled="newSceneName.length <= 0" type="primary">Add</el-button>
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

.scene-entry-content {
  width: 100%;
  height: 100%;
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

.scene-entry-preview-title {
  margin-right: 30px;
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

.bottom-text * {
  margin: auto 0;
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

.illust-rect {
  width: 150px;
  height: 110px;
  background-color: #333333;
  border-radius: 8px;
  opacity: 0.9;
  filter: brightness(2.1) contrast(2);
}

html.dark {
  .illust-rect {
    filter: contrast(2);
  }
}

.story-entry-dropdown {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  filter: drop-shadow(0px 0px 5px #000000);
  color: #fff;
  margin: 5px;
  z-index: 10;
}
</style>