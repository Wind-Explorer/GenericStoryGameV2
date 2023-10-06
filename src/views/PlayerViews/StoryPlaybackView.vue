<script setup lang="ts">
// Scripts for the component
import { onMounted, ref } from 'vue';
import { StoryInfo, resolveStoryInfo, SceneInfo, resolveSceneInfo } from '../../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import router from '../../router';
import { sleep } from '../../scripts/utils';
import { strings } from '../../scripts/strings';

const props = defineProps({
  baseDir: String
})

const storyInfo = ref<StoryInfo>(
  await resolveStoryInfo(
    decodeURIComponent(props.baseDir as string)
  )
);

let sceneElement: HTMLElement;
let splashElement: HTMLElement;

const isPlaying = ref(false);

/**
 * Playback intro animation.
 */
async function playbackIntroAnimation() {

  // Set transition timings for both elements.
  splashElement.style.transition = 'opacity 1s ease-in-out';
  sceneElement.style.transition = 'opacity 0.5s ease-in-out';

  // Set opacity to 1 for splash screen.
  splashElement.style.opacity = '1';

  // Wait for three seconds before setting splash screen's opacity to zero again.
  await sleep(3000);
  splashElement.style.opacity = '0';

  // While no elements are visible, toggle visibility boolean.
  await sleep(1000);
  isPlaying.value = true;

  // Wait for half a second before setting scene's opacity to one.
  await sleep(500);
  sceneElement.style.opacity = '1';
}

onMounted(() => {
  sceneElement = document.getElementById('scene') as HTMLElement;
  splashElement = document.getElementById('splash') as HTMLElement;
  playbackIntroAnimation();
})

const current_scene = ref<SceneInfo>(
  await resolveSceneInfo(storyInfo.value.entry_point)
);

/**
 * Prepare scene navigation with animation playback.
 * @param scenePath 
 * @param single_choice 
 */
async function initiateNavigation(scenePath: string) {
  // Check if destination is the end.
  if (scenePath == strings.navigationKeywords.end) {
    // Router back to where user came from (PlayOptionsPage).
    router.go(-1);
    return;
  }
  navigateToScene(scenePath);
}

/**
 * Executes changing of scene data.
 * @param scenePath 
 */
async function navigateToScene(scenePath: string) {
  current_scene.value = await resolveSceneInfo(scenePath);
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
        <div class="click-anywhere-to-continue-div" :hidden="current_scene.scene_actions.single_choice == null"
          @click="initiateNavigation(current_scene.scene_actions.single_choice as string)">
          <p>
            Click
            anywhere to continue</p>
        </div>
      </div>
      <div class="narration-text-div">
        <p>{{ current_scene.narration_text }}</p>
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
        <div :hidden="current_scene.background_color == null" class="plain-color-media"
          :style="`background-color: ${current_scene.background_color};`"></div>
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

.media img,
.plain-color-media {
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

.click-anywhere-to-continue-div {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.click-anywhere-to-continue-div p {
  position: absolute;
  bottom: 3vw;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 1.8vw;
  text-shadow: 0px 0px 0.1vw rgba(0, 0, 0, 1), 0px 0px 0.3vw rgba(0, 0, 0, 0.5), 0px 0px 0.8vw rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  font-weight: 300;
}

/* 
  font-size: 1.8vw;
  text-shadow: 0px 0px 0.3vw rgba(0, 0, 0, 1), 0px 0px 1.4vw rgba(0, 0, 0, 1);
  opacity: 0.7;
  font-weight: 400;
*/

.narration-text-div p {
  position: absolute;
  top: 0;
  margin: 3vw;
  margin-right: 60vw;
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

.mcq-button:hover,
.mcq-button:focus {
  font-weight: 600;
  backdrop-filter: blur(0.08vw);
  -webkit-backdrop-filter: blur(0.08vw);
}

.mcq-button:hover {
  box-shadow: inset -0.3vw 0 0 #fff, 0.2vw 0 #000;
}
</style>