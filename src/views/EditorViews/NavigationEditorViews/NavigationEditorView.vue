<script setup lang="ts">
// Scripts for the component
import { House, InfoFilled } from '@element-plus/icons-vue';
import { VueFlow, XYPosition, isNode, Position, CoordinateExtent, Elements, ConnectionMode } from '@vue-flow/core'
import { ref } from 'vue'
// import { ScenesManager } from '../../../scripts/scenesManager';
import { SceneInfo, resolveSceneInfo, resolveStoryInfo } from '../../../scripts/story';
import { newUUID } from '../../../scripts/utils';
import dagre from 'dagre'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'
import '@vue-flow/controls/dist/style.css'

const props = defineProps({
  baseDir: String,
})

const baseDir = decodeURIComponent(props.baseDir as string);

// var elements: Ref<Elements> = ref([])

// const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

const dagreGraph = new dagre.graphlib.Graph()

dagreGraph.setDefaultEdgeLabel(() => ({}))

const elements = ref<Elements>([])

function onLayout(direction: string) {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  elements.value.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 150, height: 50 })
    } else {
      dagreGraph.setEdge(el.source, el.target)
    }
  })

  dagre.layout(dagreGraph)

  elements.value.forEach((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id)
      el.targetPosition = isHorizontal ? Position.Left : Position.Top
      el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom
      el.position = { x: nodeWithPosition.x, y: nodeWithPosition.y }
    }
  })
}

async function loadSceneTree(currentScene: SceneInfo, parentId: string | null = null, iteratedScenes: SceneInfo[] = []) {
  const isLeaf = (currentScene.scene_actions.single_choice == null || currentScene.scene_actions.single_choice == "#END") && currentScene.scene_actions.multiple_choice == null;
  const id = newUUID().toString();
  const nodeText = currentScene.center_text ?? currentScene.narration_text ?? "No text";
  let newIteratedScenes = new Array(...iteratedScenes) ?? [];
  newIteratedScenes.push(currentScene);

  if (iteratedScenes.some(elem => { return JSON.stringify(currentScene) === JSON.stringify(elem) })) {
    const newId = newUUID().toString();
    pushNode(newId, "[Loop] " + nodeText, parentId, false);

    return
  }

  if (isLeaf) {
    pushNode(id, nodeText, parentId, false);

    return
  }

  if (currentScene.scene_actions.single_choice != null) {
    if (currentScene.scene_actions.single_choice == "#END") {
      const newId = newUUID().toString();
      pushNode(newId, "End", id, false);

      return
    }

    const child = await resolveSceneInfo(currentScene.scene_actions.single_choice);

    loadSceneTree(child, id, newIteratedScenes);
  } else if (currentScene.scene_actions.multiple_choice != null) {
    for (let i = 0; i < currentScene.scene_actions.multiple_choice.length; i++) {
      const choice = currentScene.scene_actions.multiple_choice[i];

      if (choice.destination == "#END") {
        const newId = newUUID().toString();
        pushNode(newId, "End", id, false);

        continue
      } else {
        const child = await resolveSceneInfo(choice.destination);

        loadSceneTree(child, id, newIteratedScenes);
      }
    }
  }

  pushNode(id, nodeText, parentId, true);
}

function pushNode(id: string, label: string, parentId: string | null = null, hasChildren: boolean) {
  let position: XYPosition = { x: 0, y: 0 };

  elements.value.push({
    id: id,
    label: label,
    position,
    type: parentId == null ? "input" : hasChildren ? "default" : "output",
    // parentNode: parentId
  })

  if (parentId != null) {
    pushEdge(parentId!, id);
  }
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
onLayout('TB')

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="page-title">
      <h1>Story navigation</h1>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <VueFlow v-model="elements" :connection-mode="ConnectionMode.Loose" @pane-ready="onLayout('TB')">
      <Background/>
      <Controls />
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
