<script setup lang="ts">
// Scripts for the component
import { onMounted, ref } from 'vue';
import { resolveStoryInfo, resolveSceneInfo } from '../../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { dialogStyling } from '../../scripts/dialog.css'
import { sleep } from '../../scripts/utils';
import { StoryPlaybackHandler } from '../../scripts/storyPlaybackHandler';

const props = defineProps({
  baseDir: String
})

const storyInfo = await resolveStoryInfo(decodeURIComponent(props.baseDir as string));

const storyPlaybackHandler = ref<StoryPlaybackHandler>(
  new StoryPlaybackHandler(
    storyInfo,
    await resolveSceneInfo(storyInfo.entry_point)
  )
);

let sceneElement: HTMLElement;
let splashElement: HTMLElement;
let pauseButton: HTMLElement;

const isPlaying = ref(false);
const playbackPaused = ref(false);

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

  // Wait for a bit before hiding pause menu button.
  await sleep(500);
  pauseButton.classList.add('hidden');
}

onMounted(() => {
  sceneElement = document.getElementById('scene') as HTMLElement;
  splashElement = document.getElementById('splash') as HTMLElement;
  pauseButton = document.querySelector('.pause-button') as HTMLElement;
  playbackIntroAnimation();
})

function togglePauseBtn(visible: boolean) {
  if (visible) {
    pauseButton.classList.remove('hidden');
  } else {
    pauseButton.classList.add('hidden');
  }
}

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div id="splash" :hidden="isPlaying">
      <h1 class="splash-text">{{ storyPlaybackHandler.storyInfo.title }}</h1>
    </div>
    <div id="scene" :hidden="!isPlaying">
      <el-dialog :style="dialogStyling" v-model="playbackPaused" :show-close="false" width="80%" align-center>
        <div class="pause-menu-div-1">
          <img class="pause-menu-thumbnail" :src="convertFileSrc(storyPlaybackHandler.storyInfo.thumbnail)" />
          <div class="pause-menu-div-2">
            <div class="pause-menu-story-details">
              <h1>{{ storyPlaybackHandler.storyInfo.title }}</h1>
              <h3 class="pause-menu-story-details author">by {{ storyPlaybackHandler.storyInfo.author }}</h3>
              <p class="pause-menu-story-details description">{{ storyPlaybackHandler.storyInfo.description }}</p>
            </div>
            <div class="pause-menu-actions">
              <el-dropdown split-button trigger="click" size="large">
                Save & Leave
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="storyPlaybackHandler.exitStory()">Leave
                      without
                      saving</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button @click="playbackPaused = false" class="pause-menu-actions resume-button" size="large"
                type="success" plain>Resume</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
      <div class="pause-button" @click="playbackPaused = true" @mouseenter="togglePauseBtn(true)"
        @mouseleave="togglePauseBtn(false)">
        <el-icon>
          <VideoPause />
        </el-icon>
      </div>
      <div class="center-text-div" :hidden="storyPlaybackHandler.currentScene.center_text == null">
        <p class="playback-text-attention">{{ storyPlaybackHandler.currentScene.center_text }}</p>
        <div class="click-anywhere-to-continue-div"
          :hidden="storyPlaybackHandler.currentScene.scene_actions.single_choice == null"
          @click="storyPlaybackHandler.navigateToScene(storyPlaybackHandler.currentScene.scene_actions.single_choice as string)">
          <p class="playback-text-catc">
            Click
            anywhere to continue</p>
        </div>
      </div>
      <div class="narration-text-div"
        :hidden="storyPlaybackHandler.currentScene.narration_text == null || storyPlaybackHandler.currentScene.narration_text.length <= 0">
        <p class="playback-text-narration">{{ storyPlaybackHandler.currentScene.narration_text }}</p>
      </div>
      <div class="mcq-div">
        <div class="mcq" :hidden="storyPlaybackHandler.currentScene.scene_actions.multiple_choice == null"
          v-for="navigation_option in storyPlaybackHandler.currentScene.scene_actions.multiple_choice"
          :id="encodeURIComponent(navigation_option.destination)">
          <button class="mcq-button playback-text-action" :key="navigation_option.destination"
            @click="storyPlaybackHandler.navigateToScene(navigation_option.destination)">{{
              navigation_option.action }}</button>
        </div>
      </div>
      <div class="media">
        <div :hidden="storyPlaybackHandler.currentScene.background_color == null" class="plain-color-media"
          :style="`background-color: ${storyPlaybackHandler.currentScene.background_color};`"></div>
        <img :hidden="storyPlaybackHandler.currentScene.media == null"
          :src="convertFileSrc(storyPlaybackHandler.currentScene.media as string)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */

#splash {
  position: absolute;
  width: 100vw;
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  top: 0;
  bottom: 0;
}

.splash-text {
  font-size: 6vw;
  position: relative;
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

.center-text-div p {
  position: relative;
  font-size: 6vw;
  height: min-content;
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
}

.narration-text-div p {
  position: absolute;
  top: 0;
  margin: 3vw;
  margin-right: 60vw;
  font-size: 2.3vw;
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
  all: unset;
  color: white;
  font-size: 2.2vw;
  transition: 0.1s;
}

.pause-button {
  position: absolute;
  right: 0;
  top: 1vw;
  width: 5vw;
  height: 5vw;
  background-color: #77777777;
  border-radius: 50% 0 0 50%;
  font-size: 5vw;
  transition: 0.2s;
  z-index: 1000;
}

.pause-button * {
  color: white;
}

.pause-button.hidden {
  transform: translateX(3vw);
  opacity: 0.1;
}

/* Pause menu CSS */
.pause-menu-div-1 {
  position: relative;
  display: flex;
  flex-direction: row;
  margin: 0 30px 30px 30px;
  gap: 30px;
}

.pause-menu-thumbnail {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #77777777;
  margin: auto 0;
}

.pause-menu-div-2 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}

.pause-menu-story-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pause-menu-story-details.author {
  opacity: 0.7;
}

.pause-menu-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.pause-menu-actions.resume-button {
  flex-grow: 1;
}
</style>