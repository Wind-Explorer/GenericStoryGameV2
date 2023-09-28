<script setup lang="ts">
// Scripts for the component
import { PropType, ref } from 'vue';
import { StoryInfo } from '../scripts/story';
import { convertFileSrc } from '@tauri-apps/api/tauri';

const props = defineProps({
  storyInfo: Object as PropType<StoryInfo>,
})

const showTime = ref(false);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="story-info" v-if="props.storyInfo != null">
      <div class="thumbnail">
        <img :src="convertFileSrc(props.storyInfo.thumbnail)" :alt="`Thumbnail image for ${props.storyInfo.title}`" />
      </div>
      <div class="textual">
        <h2>{{ props.storyInfo.title }}</h2>
        <h3>by {{ props.storyInfo.author }}</h3>
        <p id="story-description">{{ props.storyInfo.description }}</p>
        <p class="time-date" v-if="!showTime" @click="() => { showTime = !showTime }">{{
          props.storyInfo.creation_date.toLocaleDateString()
        }}</p>
        <p class="time-date" v-if="showTime" @click="() => { showTime = !showTime }">{{
          props.storyInfo.creation_date.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.story-info {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-right: 40px;
}

.textual {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-top: auto;
  margin-bottom: auto;
  gap: 8px;
  width: 100%;
}

.textual * {
  width: 100%;
}


.textual h3 {
  opacity: 0.7;
  font-weight: 500;
}

.time-date {
  opacity: 0.5;
  font-size: 13px;
}

.time-date:hover {
  opacity: 1;
}

.thumbnail {
  margin: auto auto;
}

.thumbnail img {
  height: 90px;
  width: 90px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #77777777;
}

#story-description {
  border-left: 4px solid #77777777;
  padding: 8px;
  border-radius: 4px;
  background-color: #77777711;
  opacity: 0.7;
}
</style>