<script setup lang="ts">
// Scripts for the component
import { resolveScenesFromFS } from '../../scripts/story';

const props = defineProps({
  baseDir: String,
})

const scenesList = await resolveScenesFromFS(decodeURIComponent(props.baseDir as string));
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <h1>Scenes Editor</h1>
    <div v-for="scene in scenesList">
      <h3>{{ scene.scene_name }}</h3>
      <p>Center text: {{ scene.base_scene_info.center_text }}</p>
      <p>Narration text: {{ scene.base_scene_info.narration_text }}</p>
    </div>
    <el-button @click="$router.go(-1)">back</el-button>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
  margin: 30px;
}
</style>