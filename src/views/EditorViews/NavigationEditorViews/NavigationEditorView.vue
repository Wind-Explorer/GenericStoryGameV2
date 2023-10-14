<script setup lang="ts">
// Scripts for the component
import { House, InfoFilled } from '@element-plus/icons-vue';
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Ref, ref } from 'vue'
import { ScenesManager } from '../../../scripts/scenesManager';
import { ExtraSceneInfo, SceneInfo, resolveSceneInfo, resolveScenesFromFS, resolveStoryInfo } from '../../../scripts/story';
import { newUUID } from '../../../scripts/utils';
import { en, pa } from 'element-plus/es/locale/index.mjs';

const props = defineProps({
  baseDir: String,
})

const baseDir = decodeURIComponent(props.baseDir as string);

var elements: Ref<any[]> = ref([])

const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

async function loadSceneTree(currentScene: SceneInfo, parentId: string | null = null, iteratedScenes: SceneInfo[] = []) {
  const isLeaf = (currentScene.scene_actions.single_choice == null || currentScene.scene_actions.single_choice == "#END") && currentScene.scene_actions.multiple_choice == null;
  const id = newUUID().toString();
  let newIteratedScenes = new Array(...iteratedScenes) ?? [];
  newIteratedScenes.push(currentScene);
  
  console.log("leaf")
  // console.log(currentScene.scene_actions.single_choice)
  // console.log(currentScene.scene_actions.multiple_choice)
  console.log(isLeaf)

  console.log("contains scenes")
  console.log(iteratedScenes)
  console.log(currentScene);
  console.log(iteratedScenes.some(elem => { return JSON.stringify(currentScene) === JSON.stringify(elem) }))
  if (iteratedScenes.some(elem => { return JSON.stringify(currentScene) === JSON.stringify(elem) })) {
    const newId = newUUID().toString();
    pushNode(newId, "[Loop] " + currentScene.center_text ?? currentScene.narration_text ?? "No text", parentId, false);
    pushEdge(parentId!, newId);

    return
  }

  if (isLeaf) {
    pushNode(id, currentScene.center_text ?? currentScene.narration_text ?? "No text", parentId, false);

    return
  } else {
    console.log("1")
    console.log(currentScene.scene_actions.single_choice)

    if (currentScene.scene_actions.single_choice != null) {
      if (currentScene.scene_actions.single_choice == "#END") {
        const newId = newUUID().toString();
        pushNode(newId, "End", id, false);
        pushEdge(id, newId);

        return
      }

      const child = await resolveSceneInfo(currentScene.scene_actions.single_choice);

      loadSceneTree(child, id, newIteratedScenes);
    } else if (currentScene.scene_actions.multiple_choice != null) {
      for (const choice of currentScene.scene_actions.multiple_choice) {
        if (choice.destination == "#END") {
          const newId = newUUID().toString();
          pushNode(newId, "End", id);
          pushEdge(id, newId);

          continue
        } else {
          const child = await resolveSceneInfo(choice.destination);

          console.log("dest")
          console.log(choice.destination)

          loadSceneTree(child, id, newIteratedScenes);
        }
      }
    }

    pushNode(id, currentScene.center_text ?? currentScene.narration_text ?? "No text", parentId, true);
    pushEdge(parentId!, id);
  }
}

function pushNode(id: string, label: string, parentId: string | null = null, hasChildren: boolean, num: number = 1, max: number = 1) {
  elements.value.push({
    id: id,
    label: label,
    position: { x: 100, y: 100 },
    type: parentId == null ? "input" : hasChildren ? "default" : "output",
    parentNode: parentId
  })
}

function pushEdge(sourceId: string, targetId: string) {
  elements.value.push({
    id: "e" + sourceId + "-" + targetId,
    source: sourceId,
    target: targetId
  })
}

const storyInfo = await resolveStoryInfo(baseDir);
const entryPoint = await resolveSceneInfo(storyInfo.entry_point);

loadSceneTree(entryPoint);
console.log("elements")
console.log(elements.value);

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
