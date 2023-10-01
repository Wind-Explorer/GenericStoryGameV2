<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Refresh, FolderOpened, Download } from '@element-plus/icons-vue';
import { ElMessage, ElScrollbar } from 'element-plus'
import { StoryInfo, resolveStoriesFromFS } from '../scripts/story';
import { ref } from 'vue';
import StoriesListEntry from './StoriesListEntry.vue';

const story_entry_scroll = ref<InstanceType<typeof ElScrollbar>>()

const storyInfos = ref<StoryInfo[]>([]);
storyInfos.value = await resolveStoriesFromFS();

async function refreshStoriesList() {
  storyInfos.value = await resolveStoriesFromFS();
  if (story_entry_scroll.value != null) {
    story_entry_scroll.value.setScrollTop(0);
  }
  ElMessage({ message: 'Refreshed', grouping: true, type: 'success' })
}

async function importStory() {
  // TODO: implement
}

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <el-empty id="empty-story-list" v-if="storyInfos.length == 0"
      description="Looks like you've got no stories in your collection!">
      <el-button :icon="Refresh" @click="refreshStoriesList">Refresh</el-button>
      <el-button :icon="FolderOpened" disabled>Import...</el-button>
    </el-empty>
    <el-scrollbar id="story-entry-scroll" ref="story_entry_scroll" v-if="storyInfos.length > 0">
      <el-card v-for="storyInfo in storyInfos" shadow="hover" class="story-entry-card">
        <div class="story-entry" :key="storyInfo.entry_point">
          <StoriesListEntry :story-info="storyInfo" />
          <el-button @click="$router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`)" type="success"
            plain size="large" :icon="VideoPlay" round class="play-button">Play</el-button>
        </div>
      </el-card>
      <div class="list-bottom">
        <el-button id="refresh-button" class="list-bottom-button" :icon="Refresh"
          @click="refreshStoriesList()">Refresh</el-button>
        <el-button id="import-button" class="list-bottom-button" :icon="Download"
          @click="importStory()">Import</el-button>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
</style>