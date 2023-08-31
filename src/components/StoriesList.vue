<script setup lang="ts">
// Scripts for the component
import { VideoPlay } from '@element-plus/icons-vue';
import { StoryInfo, getStoryInfo } from '../scripts/story';
import { ref } from 'vue';

const storyInfos = ref<StoryInfo[]>([]);
storyInfos.value = await getStoryInfo();

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <el-scrollbar>
      <el-card v-for="storyInfo in storyInfos" shadow="hover" class="story-entry-card">
        <div class="story-entry" :key="storyInfo.entry_point">
          <div class="story-info">
            <div class="thumbnail">
              <!-- <img :src="storyInfo.thumbnail" alt="Story thumbnail" /> -->
            </div>
            <div class="textual">
              <h2>{{ storyInfo.title }}</h2>
              <h3>{{ storyInfo.author }}</h3>
              <p>{{ storyInfo.creation_date.toLocaleDateString() }}</p>
            </div>
          </div>
          <el-button type="success" plain size="large" :icon="VideoPlay" round class="play-button">Play</el-button>
        </div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
html.dark {
  .stories-list {
    background-color: #181818;
  }
}

.story-entry-card {
  margin: 15px;
}

.story-entry {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.play-button {
  font-size: 20px;
  position: relative;
  margin-top: auto;
  margin-bottom: auto;
}

.story-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.textual {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-top: auto;
  margin-bottom: auto;
  gap: 5px;
}

.story-info h3 {
  opacity: 0.7;
  font-weight: 500;
}

.story-info p {
  opacity: 0.5;
  font-size: 13px;
}
</style>