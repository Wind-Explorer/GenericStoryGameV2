<script setup lang="ts">
// Scripts for the component
import { onMounted, ref } from 'vue';
import { StoryInfo, resolveStoryInfo, SceneInfo, resolveSceneInfo } from '../../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';

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

function initiateNavigation(scenePath: string) {
  const mcq = document.getElementsByClassName('mcq') as HTMLCollectionOf<HTMLElement>;
  for (var i = 0; i < mcq.length; i++) {
    const btnDiv = mcq[i];
    if (btnDiv.id != encodeURIComponent(scenePath)) {
      const btn = btnDiv.querySelector('button') as HTMLButtonElement;
      btn.disabled = true;
      btnDiv.style.filter = `blur(2vw)`;
      btnDiv.style.opacity = '0';
      setTimeout(() => {
        btnDiv.style.opacity = '1';
        btnDiv.style.filter = '';
        btn.disabled = false;
      }, 5000)
    }
  }
}

async function navigateToScene(scenePath: string) {
  current_scene.value = await resolveSceneInfo(
    scenePath,
    storyInfo.value.base_dir
  );
}
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div id="splash" :hidden="isPlaying">
      <h1>{{ storyInfo.title }}</h1>
    </div>
    <div id="scene" :hidden="!isPlaying">
      <div class="center-text-div" :hidden="current_scene.center_text == null">
        <p class="center-text">{{ current_scene.center_text }}</p>
        <p class="center-text-hint" @click="$router.go(-1)">Click anywhere to continue</p>
      </div>
      <div class="narration-text-div">
        <p :hidden="current_scene.narration_text == null">{{ current_scene.narration_text }}</p>
      </div>
      <div class="mcq-div">
        <div class="mcq" :hidden="current_scene.scene_actions.multiple_choice == null"
          v-for="navigation_option in current_scene.scene_actions.multiple_choice"
          :id="encodeURIComponent(navigation_option.destination)">
          <button class="mcq-button" :key="navigation_option.destination"
            @click="initiateNavigation(navigation_option.destination)">{{
              navigation_option.action }}</button>
        </div>
      </div>
      <div class="media">
        <img :hidden="current_scene.media == null" :src="convertFileSrc(current_scene.media as string)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */

p,
button {
  all: unset;
  color: white;
}

#splash {
  position: absolute;
  width: 100vw;
  height: 100vh;
  opacity: 0;
}

#splash h1 {
  font-size: 6vw;
  position: relative;
  line-height: 100vh;
  text-align: center;
}

#scene {
  opacity: 0;
}

.media img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -10;
}

.center-text-div {
  display: flex;
  justify-content: center;
  height: 100vh;
}

.center-text {
  position: relative;
  font-size: 6vw;
  font-weight: 600;
  height: min-content;
  text-shadow: 0px 0px 0.3vw rgba(0, 0, 0, 1), 0px 0px 1.4vw rgba(0, 0, 0, 1);
  margin: auto 3vw;
  text-align: center;
}

.center-text-hint {
  position: absolute;
  bottom: 3vw;
  font-size: 1.8vw;
  text-shadow: 0px 0px 0.3vw rgba(0, 0, 0, 1), 0px 0px 1.4vw rgba(0, 0, 0, 1);
  opacity: 0.7;
  font-weight: 400;
}

.narration-text-div p {
  position: absolute;
  top: 3vw;
  left: 3vw;
  font-size: 2.3vw;
  text-shadow: 0px 0px 0.3vw rgba(0, 0, 0, 1), 0px 0px 1vw rgba(0, 0, 0, 1);
  font-weight: 400;
}

.mcq {
  transition: 2s;
}

.mcq-div {
  position: absolute;
  bottom: 3vw;
  right: 3vw;
  display: flex;
  flex-direction: column;
  text-align: right;
  gap: 1vw;
}

.mcq-button {
  font-size: 2.2vw;
  padding: 0.3vw 1vw;
  font-weight: 400;
  text-shadow: 0px 0px 0.3vw rgba(0, 0, 0, 1), 0px 0px 1vw rgba(0, 0, 0, 1);
  transition: 0.1s;
}

.mcq-button:hover {
  box-shadow: inset -0.3vw 0 0 #fff, 0.2vw 0 #000;
  font-weight: 600;
  backdrop-filter: blur(0.08vw);
  -webkit-backdrop-filter: blur(0.08vw);
}
</style>