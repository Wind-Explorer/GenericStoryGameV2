<script setup lang="ts">
// Scripts for the component
import { Edit, More, Refresh, FolderOpened } from '@element-plus/icons-vue';
import { ElMessage, ElScrollbar } from 'element-plus'
import { StoryInfo, StoryLocation, resolveStoriesFromFS } from '../scripts/story';
import { ref } from 'vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';

const showTime = ref<boolean>(false);
const story_entry_scroll = ref<InstanceType<typeof ElScrollbar>>()

const storyInfos = ref<StoryInfo[]>([]);
storyInfos.value = await resolveStoriesFromFS(StoryLocation.Workspace);

async function refreshStoriesList() {
  storyInfos.value = await resolveStoriesFromFS(StoryLocation.Workspace);
  if (story_entry_scroll.value != null) {
    story_entry_scroll.value.setScrollTop(0);
  }
  ElMessage({ message: 'Refreshed', grouping: true, type: 'success' })
}

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <el-empty id="empty-story-list" v-if="storyInfos.length == 0"
      description="Looks like you've got no stories in your collection!">
      <el-button type="default" :icon="Refresh" @click="refreshStoriesList">Refresh</el-button>
      <el-button type="default" :icon="FolderOpened" disabled>Import...</el-button>
    </el-empty>
    <el-scrollbar id="story-entry-scroll" ref="story_entry_scroll" v-if="storyInfos.length > 0">
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
          <div class="play-button">
            <el-dropdown class="story-entry-dropdown">
              <el-icon>
                <More />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Details</el-dropdown-item>
                  <el-dropdown-item>Move into collection</el-dropdown-item>
                  <el-dropdown-item>Export...</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="$router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`)" type="primary"
              plain size="large" :icon="Edit" round>Edit</el-button>
          </div>
        </div>
      </el-card>
      <el-button id="refresh-button" type="default" :icon="Refresh" @click="refreshStoriesList">Refresh</el-button>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
#empty-story-list {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#story-entry-scroll {
  padding: 15px;
}

.story-entry-card {
  margin-bottom: 15px;
}

.story-entry {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#refresh-button {
  width: 100%;
}

.play-button {
  position: relative;
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  gap: 20px;
}

.play-button * {
  font-size: 20px;
}

.story-info {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.story-entry-dropdown {
  margin-top: auto;
  margin-bottom: auto;
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