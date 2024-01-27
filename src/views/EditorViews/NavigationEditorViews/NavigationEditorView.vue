<script setup lang="ts">
// Scripts for the component
import { House, Select, InfoFilled } from '@element-plus/icons-vue';
import { VueFlow, XYPosition, isNode, Position, ConnectionMode, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
// import { ScenesManager } from '../../../scripts/scenesManager';
import { ExtraSceneInfo, SceneInfo, resolveSceneInfo, resolveScenesFromFS, resolveStoryInfo, sceneNameToRelativePath } from '../../../scripts/story';
import { newUUID } from '../../../scripts/utils';
import dagre from 'dagre'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'
import '@vue-flow/controls/dist/style.css'
import router from '../../../router';
import { ScenesManager } from '../../../scripts/scenesManager';
import CustomStoryNode from './CustomStoryNode.vue';
import DeletableEdge from './DeletableEdge.vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  baseDir: String,
})

const baseDir = decodeURIComponent(props.baseDir as string);

// var elements: Ref<Elements> = ref([])

const scenesManager = ref(new ScenesManager(await resolveScenesFromFS(baseDir), baseDir));

const { updateEdge, findNode, addEdges, addNodes, project, vueFlowRef, onEdgesChange } = useVueFlow()

const dagreGraph = new dagre.graphlib.Graph()

dagreGraph.setDefaultEdgeLabel(() => ({}))

const elements = ref<any>([])

function onLayout(direction: string) {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  elements.value.forEach((el: any) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 150, height: 50 })
    } else {
      dagreGraph.setEdge(el.source, el.target)
    }
  })

  dagre.layout(dagreGraph)

  elements.value.forEach((el: any) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id)
      el.targetPosition = isHorizontal ? Position.Left : Position.Top
      el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom
      el.position = { x: nodeWithPosition.x, y: nodeWithPosition.y }
    }
  })
}

function removeBaseDir(path: string) {
  return path.replace(baseDir + "/", "");
}

async function loadSceneTree(currentScene: SceneInfo, currentScenePath: string, parentId: string | null = null, iteratedScenes: SceneInfo[] = []) {
  const isLeaf = (currentScene.scene_actions.single_choice == null || currentScene.scene_actions.single_choice == "#END") && currentScene.scene_actions.multiple_choice == null;
  const id = removeBaseDir(currentScenePath) + "#" + newUUID().toString();
  const nodeText = currentScene.center_text ?? currentScene.narration_text ?? "No text";
  let newIteratedScenes = new Array(...iteratedScenes) ?? [];
  newIteratedScenes.push(currentScene);

  if (iteratedScenes.some(elem => { return JSON.stringify(currentScene) === JSON.stringify(elem) })) {
    const newId = removeBaseDir(currentScenePath) + "#" + newUUID().toString();
    pushNode(newId, "[Loop] " + nodeText, parentId, false, currentScenePath, currentScene);

    return
  }

  if (isLeaf) {
    pushNode(id, nodeText, parentId, false, currentScenePath, currentScene);

    return
  }

  if (currentScene.scene_actions.single_choice != null) {
    if (currentScene.scene_actions.single_choice == "#END") {
      const newId = removeBaseDir(currentScenePath) + "#" + newUUID().toString();
      pushNode(newId, "End", id, false, currentScenePath, currentScene);

      return
    }

    const child = await resolveSceneInfo(currentScene.scene_actions.single_choice);

    await loadSceneTree(child, currentScene.scene_actions.single_choice, id, newIteratedScenes);
  } else if (currentScene.scene_actions.multiple_choice != null) {
    for (let i = 0; i < currentScene.scene_actions.multiple_choice.length; i++) {
      const choice = currentScene.scene_actions.multiple_choice[i];

      if (choice.destination == "#END") {
        const newId = removeBaseDir(currentScenePath) + "#" + newUUID().toString();
        pushNode(newId, "End", id, false, currentScenePath, currentScene);

        continue
      } else {
        const child = await resolveSceneInfo(choice.destination);

        await loadSceneTree(child, choice.destination, id, newIteratedScenes);
      }
    }
  }

  pushNode(id, nodeText, parentId, true, currentScenePath, currentScene);
}

function pushNode(id: string, label: string, parentId: string | null = null, hasChildren: boolean, scenePath: string, scene: SceneInfo) {
  const nodetype = parentId == null ? "input" : hasChildren ? "default" : "output"

  pushNodeLone(id, label, { x: 0, y: 0 }, nodetype, removeBaseDir(scenePath), scene);

  if (parentId != null) {
    pushEdge(parentId!, id);
  }
}

function pushNodeLone(id: string, label: string, position: XYPosition, nodetype: string, scenePath: string, scene: SceneInfo) {
  elements.value.push({
    id: id,
    label: label.substring(0, 50) + (label.length > 50 ? "..." : ""),
    position: position,
    type: "custom",
    data: { scene: scene, nodetype: nodetype },
    isValidSourcePos: () => {
      if (scene.scene_actions.single_choice != null) {
        return scene.scene_actions.single_choice == "";
      } else if (scene.scene_actions.multiple_choice != null) {
        return scene.scene_actions.multiple_choice.length < 4;
      }

      return false;
    },
    events: {
      click: () => {
        router.push(`/sceneeditor/${encodeURIComponent(scenePath)}`)
      }
    }
  })
}

function pushEdge(sourceId: string, targetId: string) {
  elements.value.push({
    id: "edge:" + sourceId + "+" + targetId,
    type: 'custom',
    source: sourceId,
    target: targetId,
    updatable: true,
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

  const scenePath = sceneNameToRelativePath(draggedScene!.scene_name);
  const fullScenePath = draggedScene!.scene_path;

  pushNodeLone(
    scenePath + "#" + newUUID().toString(), 
    label,
    position,
    fullScenePath == storyInfo.entry_point ? "input" : hasChildren ? "default" : "output", 
    scenePath, 
    scene
  );

  // // update scene
  // const index = scenesManager.value.scenesList.findIndex(elem => elem.scene_path == fullScenePath);
  // const newSceneInfo = { ...scenesManager.value.scenesList[index].base_scene_info };


  // addNodes([newNode])
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

onEdgesChange((edges: any) => {
  for (let i = 0; i < edges.length; i++) {
    // remove connection from source edge to target edge in scenes list
    const sourceSceneInfo = { ...findNode(edges[i].source)!.data.scene } as SceneInfo;
    const extraSourceSceneInfo = scenesManager.value.scenesList.find(elem => removeBaseDir(elem.scene_path) == edges[i].source.split("#")[0]);
    const extraTargetSceneInfo = scenesManager.value.scenesList.find(elem => removeBaseDir(elem.scene_path) == edges[i].target.split("#")[0]);
    // const targetSceneInfo = { ...findNode(edges[i].target)!.data.scene } as SceneInfo;

    if (sourceSceneInfo.scene_actions.single_choice != null) {
      sourceSceneInfo.scene_actions.single_choice = null;
    } else if (sourceSceneInfo.scene_actions.multiple_choice != null) {
      // remove targetSceneInfo
      for (let j = 0; j < sourceSceneInfo.scene_actions.multiple_choice.length; j++) {
        const choice = sourceSceneInfo.scene_actions.multiple_choice[j];

        if (choice.destination == extraTargetSceneInfo?.scene_path) {
          sourceSceneInfo.scene_actions.multiple_choice.splice(j, 1);
        }
      }
    }

    const index = scenesManager.value.scenesList.findIndex(elem => elem.scene_path == extraSourceSceneInfo?.scene_path);
    scenesManager.value.scenesList[index].base_scene_info = sourceSceneInfo;
  }
})

function onEdgeUpdateEnd(edge: any) {
  return console.log('end update', edge)
}

function onEdgeUpdate({ edge, connection }: { edge: any; connection: any }) {
  return updateEdge(edge, connection)
}

function onConnect(params: any) {
  let newEdge = params;
  newEdge.type = 'custom';
  newEdge.id = "edge:" + params.source + "+" + params.target;

  // update graph to data and filestructure
  const sourceSceneInfo = { ...findNode(newEdge.source)!.data.scene } as SceneInfo;
  const targetSceneInfo = { ...findNode(newEdge.target)!.data.scene } as SceneInfo;

  const sourcePath = params.source.split("#")[0];
  const targetPath = params.target.split("#")[0];

  if (sourcePath == targetPath) {
    return
  }

  if (sourceSceneInfo.scene_actions.single_choice != null) {
    sourceSceneInfo.scene_actions.single_choice = targetPath;
  } else if (sourceSceneInfo.scene_actions.multiple_choice != null) {
    sourceSceneInfo.scene_actions.multiple_choice.push({ action: "New choice", destination: targetPath });
  }

  const oldSourceExtraSceneInfo = scenesManager.value.scenesList.find(elem => removeBaseDir(elem.scene_path) == sourcePath);
  const oldTargetExtraSceneInfo = scenesManager.value.scenesList.find(elem => removeBaseDir(elem.scene_path) == targetPath);
  const newSourceExtraSceneInfo: ExtraSceneInfo = { 
    scene_name: oldSourceExtraSceneInfo?.scene_name ?? "", 
    scene_path: sourcePath, 
    base_scene_info: sourceSceneInfo 
  };
  const newTargetExtraSceneInfo: ExtraSceneInfo = { 
    scene_name: oldTargetExtraSceneInfo?.scene_name ?? "", 
    scene_path: targetPath, 
    base_scene_info: targetSceneInfo 
  };

  // update scenes
  scenesManager.value.scenesList = scenesManager.value.scenesList.map(elem => {
    if (removeBaseDir(elem.scene_path) == sourcePath) {
      return newSourceExtraSceneInfo;
    } else if (removeBaseDir(elem.scene_path) == targetPath) {
      return newTargetExtraSceneInfo;
    }

    return elem;
  }); 

  // if (sourceSceneInfo.scene_actions.single_choice != null) {
  //   sourceSceneInfo.scene_actions.single_choice = targetSceneInfo.scene_path;
  // } else if (sourceSceneInfo.scene_actions.multiple_choice != null) {
  //   for (let i = 0; i < sourceSceneInfo.scene_actions.multiple_choice.length; i++) {
  //     const choice = sourceSceneInfo.scene_actions.multiple_choice[i];

  //     if (choice.destination == targetSceneInfo.scene_path) {
  //       choice.destination = "#END";
  //     }
  //   }
  // }

  // scenesManager.value.scenesList.push(new ExtraSceneInfo(newEdge.target, newEdge.data.scene, newEdge.target));

  return addEdges([newEdge])
}

async function saveData() {
	await scenesManager.value.saveScenesToFS();
	ElMessage({ message: 'Saved', grouping: true, type: 'success' })
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
      <div>
        <el-button @click="saveData" size="large" type="success" :icon="Select" plain>Save</el-button>
        <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
      </div>
    </div>
    <div class="content" @dragend="onDrop($event)">
      <VueFlow 
        v-model="elements" 
        :connection-mode="ConnectionMode.Loose" 
        class="validationflow"
        @pane-ready="onLayout('TB')" 
        @dragover="onDragOver" 
        @connect="onConnect"
        @edge-update="onEdgeUpdate"
        @edge-update-end="onEdgeUpdateEnd">
        
        <template #edge-custom="props">
          <DeletableEdge v-bind="props" />
        </template>
        <template #node-custom="props">
          <CustomStoryNode v-bind="props" />
        </template>

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
      <p>Select a scene to edit and drag to add a new scene.</p>
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
