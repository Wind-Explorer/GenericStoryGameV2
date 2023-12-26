<script setup lang="ts">
// Scripts for the component
import { House, InfoFilled } from '@element-plus/icons-vue';
import { VueFlow, XYPosition, isNode, Position, Elements, ConnectionMode, useVueFlow } from '@vue-flow/core'
import { nextTick, ref, watch } from 'vue'
// import { ScenesManager } from '../../../scripts/scenesManager';
import { ExtraSceneInfo, SceneInfo, resolveSceneInfo, resolveScenesFromFS, resolveStoryInfo } from '../../../scripts/story';
import { newUUID } from '../../../scripts/utils';
import dagre from 'dagre'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'
import '@vue-flow/controls/dist/style.css'
import router from '../../../router';
import { ScenesManager } from '../../../scripts/scenesManager';

const props = defineProps({
  baseDir: String,
})

const baseDir = decodeURIComponent(props.baseDir as string);

// var elements: Ref<Elements> = ref([])

const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

const { findNode, onConnect, addEdges, addNodes, project, vueFlowRef } = useVueFlow()

const dagreGraph = new dagre.graphlib.Graph()

dagreGraph.setDefaultEdgeLabel(() => ({}))

const elements = ref<Elements>([])

elements.value.push({
  id: "origin",
  type: "input",
  position: { x: 0, y: 0 },
  label: "Origin",
})

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

async function loadSceneTree(currentScene: SceneInfo, currentScenePath: string, parentId: string | null = null, iteratedScenes: SceneInfo[] = []) {
  const isLeaf = (currentScene.scene_actions.single_choice == null || currentScene.scene_actions.single_choice == "#END") && currentScene.scene_actions.multiple_choice == null;
  const id = newUUID().toString();
  const nodeText = currentScene.center_text ?? currentScene.narration_text ?? "No text";
  let newIteratedScenes = new Array(...iteratedScenes) ?? [];
  newIteratedScenes.push(currentScene);

  if (iteratedScenes.some(elem => { return JSON.stringify(currentScene) === JSON.stringify(elem) })) {
    const newId = newUUID().toString();
    pushNode(newId, "[Loop] " + nodeText, parentId, false, currentScenePath);

    return
  }

  if (isLeaf) {
    pushNode(id, nodeText, parentId, false, currentScenePath);

    return
  }

  if (currentScene.scene_actions.single_choice != null) {
    if (currentScene.scene_actions.single_choice == "#END") {
      const newId = newUUID().toString();
      pushNode(newId, "End", id, false, currentScenePath);

      return
    }

    const child = await resolveSceneInfo(currentScene.scene_actions.single_choice);

    await loadSceneTree(child, currentScene.scene_actions.single_choice, id, newIteratedScenes);
  } else if (currentScene.scene_actions.multiple_choice != null) {
    for (let i = 0; i < currentScene.scene_actions.multiple_choice.length; i++) {
      const choice = currentScene.scene_actions.multiple_choice[i];

      if (choice.destination == "#END") {
        const newId = newUUID().toString();
        pushNode(newId, "End", id, false, currentScenePath);

        continue
      } else {
        const child = await resolveSceneInfo(choice.destination);

        await loadSceneTree(child, choice.destination, id, newIteratedScenes);
      }
    }
  }

  pushNode(id, nodeText, parentId, true, currentScenePath);
}

function pushNode(id: string, label: string, parentId: string | null = null, hasChildren: boolean, scenePath: string) {
  let position: XYPosition = { x: 0, y: 0 };

  elements.value.push({
    id: id,
    label: label.substring(0, 50) + (label.length > 50 ? "..." : ""),
    position,
    type: parentId == null ? "input" : hasChildren ? "default" : "output",
    events: {
      click: () => {
        router.push(`/sceneeditor/${encodeURIComponent(scenePath)}`)
      }
    }
  })

  if (parentId != null) {
    pushEdge(parentId!, id);
  }
}

function pushEdge(sourceId: string, targetId: string) {
  elements.value.push({
    id: "edge:" + sourceId + "+" + targetId,
    source: sourceId,
    target: targetId
  })
}

let draggedScene: ExtraSceneInfo | null = null;

function onDragStart(event: any, scene: any) {
  if (event.dataTransfer) {
    draggedScene = scene;
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDrop(event: any) {
  // const scene = JSON.parse(event.dataTransfer?.getData('scene'))
  const scene = draggedScene!.base_scene_info;

  const { left, top, height } = vueFlowRef.value!.getBoundingClientRect()
  // const {  } = vueFlowRef.value!.getBoundingClientRect()

  // I don't know why, but the y-position is inverted. Left and top seem to be always 0.
  const position = project({
    x: event.clientX - left,
    y: (top + height) - event.clientY - top,
  })

  const hasChildren = (scene.scene_actions.single_choice != null && scene.scene_actions.single_choice != "#END") || (scene.scene_actions.multiple_choice?.length ?? 0) > 0;
  const label = scene.center_text ?? scene.narration_text ?? "No text";

  const newNode = {
    id: newUUID().toString(),
    type: draggedScene!.scene_path == storyInfo.entry_point ? "input" : hasChildren ? "default" : "output",
    position,
    label: label.substring(0, 50) + (label.length > 50 ? "..." : ""),
  }

  // addNodes([newNode])

  elements.value.push(newNode)

  // align node position after drop, so it's centered to the mouse
  // nextTick(() => {
  //   const node = findNode(newNode.id)!
  //   const stop = watch(
  //     () => node.dimensions,
  //     (dimensions) => {
  //       if (dimensions.width > 0 && dimensions.height > 0) {
  //         node.position = { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 }
  //         stop()
  //       }
  //     },
  //     { deep: true, flush: 'post' },
  //   )
  // })
}

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const storyInfo = await resolveStoryInfo(baseDir);
const entryPoint = await resolveSceneInfo(storyInfo.entry_point);

await loadSceneTree(entryPoint, storyInfo.entry_point);
onLayout('TB')

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="page-title">
      <h1>Story navigation</h1>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <div class="content" @dragend="onDrop($event)">
      <VueFlow v-model="elements" :connection-mode="ConnectionMode.Loose" @pane-ready="onLayout('TB')" @dragover="onDragOver">
        <Background/>
        <Controls />
      </VueFlow>
      <hr style="height: 100%; border: none; border-left: 1px solid #77777777;">
      <div class="events">
        <h2>Events</h2>
        <p>Drag and drop on the canvas.</p>
        <hr style="margin-top: 5px; margin-bottom: 5px;">
        <div class="event-list" v-for="scene in scenesManager.scenesList" :key="scene.scene_path">
          <el-tag class="event-list-node" draggable="true" @dragstart="onDragStart($event, scene)">
            {{ 
              (scene.base_scene_info.center_text ?? scene.base_scene_info.narration_text ?? "").substring(0, 50) + 
              ((scene.base_scene_info.center_text ?? scene.base_scene_info.narration_text ?? "").length > 50 ? "..." : "") 
            }}
          </el-tag>
        </div>
      </div>
    </div>
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

.content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.events {
  width: 350px;
  padding: 10px;
}

.event-list-node {
  margin-bottom: 5px;
}
</style>
