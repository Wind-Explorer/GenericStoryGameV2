<script setup lang="ts">
// Scripts for the component
import { onMounted, ref } from 'vue';
import { StoryInfo, resolveStoryInfo, SceneInfo, resolveSceneInfo } from '../scripts/story';

const props = defineProps({
  storyInfoDir: String
})

const storyInfo = ref<StoryInfo>(
  await resolveStoryInfo(
    decodeURIComponent(props.storyInfoDir as string)
  )
);

const isPlaying = ref(false);

function playbackIntroAnimation() {
  const splash = document.getElementById('splash') as HTMLElement;
  const scene = document.getElementById('scene') as HTMLElement;

  // Set transition timings for both elements.
  splash.style.transition = 'opacity 1s ease-in-out';
  scene.style.transition = 'opacity 0.5s ease-in-out';

  // Set opacity to 1 for splash screen.
  splash.style.opacity = '1';

  // Wait for three seconds before setting splash screen's opacity to zero again.
  const timeout1 = 3000;
  setTimeout(() => {
    splash.style.opacity = '0';
  }, timeout1);

  // While no elements are visible, toggle visibility boolean.
  const timeout2 = 1000;
  setTimeout(() => {
    isPlaying.value = true;
  }, timeout1 + timeout2);

  // Wait for half a second before setting scene's opacity to one.
  const timeout3 = 500;
  setTimeout(() => {
    scene.style.opacity = '1';
  }, timeout1 + timeout2 + timeout3);
}

onMounted(() => {
  playbackIntroAnimation();
})

const current_scene = ref<SceneInfo>(
  await resolveSceneInfo(
    storyInfo.value.entry_point,
    storyInfo.value.base_dir
  )
);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div id="splash" :hidden="isPlaying" @click="$router.go(-1)">
      <h1>{{ storyInfo.title }}</h1>
    </div>
    <div id="scene" :hidden="!isPlaying" @click="$router.go(-1)">
      <h1>Scene</h1>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
#splash {
  position: absolute;
  width: 100vw;
  height: 100vh;
  opacity: 0;
}

#splash h1 {
  font-size: 45px;
  position: relative;
  line-height: 100vh;
  text-align: center;
}

#scene {
  margin: 30px;
  opacity: 0;
}
</style>