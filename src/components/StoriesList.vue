<script setup lang="ts">
// Scripts for the component
import { VideoPlay } from '@element-plus/icons-vue';
import { StoryInfo, getStoryInfoFromDisk } from '../scripts/story';
import { ref } from 'vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';

const showTime = ref<boolean>(false);

const storyInfos = ref<StoryInfo[]>([]);
storyInfos.value = await getStoryInfoFromDisk();

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <el-scrollbar>
      <el-card v-for="storyInfo in storyInfos" shadow="hover" class="story-entry-card">
        <div class="story-entry" :key="storyInfo.entry_point">
          <div class="story-info">
            <div class="thumbnail">
              <img :src="convertFileSrc(storyInfo.thumbnail)" alt="Story thumbnail" />
            </div>
            <div class="textual">
              <h2>{{ storyInfo.title }}</h2>
              <h3>{{ storyInfo.author }}</h3>
              <p v-if="!showTime" @click="() => { showTime = !showTime }">{{
                storyInfo.creation_date.toLocaleDateString()
              }}</p>
              <p v-if="showTime" @click="() => { showTime = !showTime }">{{ storyInfo.creation_date.toLocaleString() }}
              </p>
            </div>
          </div>
          <el-button @click="$router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`)" type="success"
            plain size="large" :icon="VideoPlay" round class="play-button">Play</el-button>
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
  gap: 20px;
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

.story-info p:hover {
  opacity: 1;
}

.thumbnail img {
  height: 90px;
  width: 90px;
  object-fit: cover;
  border-radius: 4px;
}
</style>