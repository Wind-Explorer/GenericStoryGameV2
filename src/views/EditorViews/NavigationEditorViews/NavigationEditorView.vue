<script setup lang="ts">
// Scripts for the component
import { House, InfoFilled } from '@element-plus/icons-vue';
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Ref, ref } from 'vue'
import { ScenesManager } from '../../../scripts/scenesManager';
import { ExtraSceneInfo, SceneInfo, resolveSceneInfo, resolveScenesFromFS, resolveStoryInfo } from '../../../scripts/story';
import { newUUID } from '../../../scripts/utils';
import { en } from 'element-plus/es/locale/index.mjs';

const props = defineProps({
  baseDir: String,
})

const baseDir = decodeURIComponent(props.baseDir as string);

var elements = ref([
  {
    id: '1',
    label: 'node 1',
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    label: 'node 2',
    position: { x: 100, y: 200 },
  },
  {
    id: 'e1-2',
    target: '2',
    source: '1',
  },
])

console.log(baseDir)

const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

async function loadSceneTree(currentScene: SceneInfo, parentId: string | null = null) {
  const isLeaf = currentScene.scene_actions.single_choice == null && currentScene.scene_actions.multiple_choice == null;
  const id = newUUID().toString();

  if (isLeaf) {
    elements.value.push({
      id: id,
      label: currentScene.center_text ?? "No text",
      position: { x: 100, y: 100 },
      type: "output",
      parentNode: parentId,
      // target: null,
    })

    return
  } else {
    if (currentScene.scene_actions.single_choice != null) {
      const child = await resolveSceneInfo(currentScene.scene_actions.single_choice);
      loadSceneTree(child, id);
    }

    if (currentScene.scene_actions.multiple_choice != null) {
      for (const choice of currentScene.scene_actions.multiple_choice) {
        const child = await resolveSceneInfo(choice.destination);
        loadSceneTree(child, id);
      }
    }

    elements.value.push({
      id: id,
      label: currentScene.center_text ?? "No text",
      position: { x: 100, y: 100 },
      type: "default",
      parentNode: parentId
    })
  }
}

const storyInfo = await resolveStoryInfo(baseDir);
const entryPoint = await resolveSceneInfo(storyInfo.entry_point);

loadSceneTree(entryPoint);

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="page-title">
      <h1>Story navigation</h1>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <VueFlow v-model="elements">
      <Background />
    </VueFlow>
    <div class="bottom-text">
      <el-icon>
        <InfoFilled />
      </el-icon>
      <p>Select a scene to edit or add a new scene.</p>
    </div>
  </div>
</template>

<style scoped>
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
  border-bottom: 1px solid #77777777;
  padding-bottom: 12px;
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
