<script setup lang="ts">
// Scripts for the component
import { ref } from 'vue';
import { StoryInfo, getStoryInfo } from '../scripts/story';

const props = defineProps({
  storyInfoDir: String
})

const storyInfo = ref<StoryInfo>(
  await getStoryInfo(
    decodeURIComponent(props.storyInfoDir as string)
  )
);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="splash" @click="$router.go(-1)">
      <h1>{{ storyInfo.title }}</h1>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.splash {
  position: absolute;
  width: 100vw;
  height: 100vh;
  /* background-color: #000; */
}

.splash h1 {
  font-size: 45px;
  position: relative;
  line-height: 100vh;
  text-align: center;
}
</style>