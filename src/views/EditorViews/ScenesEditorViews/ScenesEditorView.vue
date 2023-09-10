<script setup lang="ts">
// Scripts for the component
import { House } from '@element-plus/icons-vue';
import { resolveScenesFromFS } from '../../../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';

const props = defineProps({
  baseDir: String,
})

const scenesList = await resolveScenesFromFS(decodeURIComponent(props.baseDir as string));
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
        <div class="scene-entry add-scene-button">
          <div class="add-scene-button content">
            <div class="add-scene-button content text">
              <el-icon class="add-scene-button content icon">
                <CirclePlus />
              </el-icon>
              <p>Add a new scene</p>
            </div>
          </div>
        </div>
        <div v-for="scene in scenesList" style="position: relative;" class="scene-entry">
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
        </div>
      </div>
    </el-scrollbar>
    <div class="bottom-text">
      <el-icon>
        <InfoFilled />
      </el-icon>
      <p>Select a scene to edit or add a new scene.</p>
    </div>
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
  border: 2px solid #77777777;
  transition: 0.2s;
}

.scene-entry:hover {
  transform: scale(1.02);
  transform-origin: bottom;
  box-shadow: -1px 3px 5px #00000077;
}

.scene-entry-preview-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
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
</style>