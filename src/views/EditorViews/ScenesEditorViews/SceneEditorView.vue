<script setup lang="ts">
import { resolveSceneInfo } from '../../../scripts/story';

// Scripts for the component

const props = defineProps({
  sceneDir: String,
})

const sceneInfo = await resolveSceneInfo(props.sceneDir as string);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <h1>Scene Editor</h1>
    <p>Edit a scene</p>
    <p>{{ sceneInfo.center_text }}{{ sceneInfo.narration_text }}</p>
    <el-button @click="$router.go(-1)">back</el-button>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
  margin: 30px;
}
</style>