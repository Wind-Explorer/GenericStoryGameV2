<script setup lang="ts">
import { ref } from 'vue';
import { StoryInfo, resolveStoryInfo } from '../../scripts/story';

// Scripts for the component

const props = defineProps({
  storyInfoDir: String
})

const storyInfo = ref<StoryInfo>(
  await resolveStoryInfo(
    decodeURIComponent(props.storyInfoDir as string)
  )
);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <p>{{ storyInfo.title }}</p>
    <p>{{ storyInfo.author }}</p>
    <p>{{ storyInfo.description }}</p>
    <el-button @click="$router.go(-1)">back</el-button>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>