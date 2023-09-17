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
        <h3>{{ props.storyInfo.author }}</h3>
        <p v-if="!showTime" @click="() => { showTime = !showTime }">{{
          props.storyInfo.creation_date.toLocaleDateString()
        }}</p>
        <p v-if="showTime" @click="() => { showTime = !showTime }">{{ props.storyInfo.creation_date.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.story-info {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.story-info h3 {
  opacity: 0.7;
  font-weight: 500;
}

.story-info p {
  opacity: 0.5;
  font-size: 13px;
}

.story-info p:hover {
  opacity: 1;
}

.textual {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-top: auto;
  margin-bottom: auto;
  gap: 5px;
}

.thumbnail img {
  height: 90px;
  width: 90px;
  object-fit: cover;
  border-radius: 4px;
}
</style>