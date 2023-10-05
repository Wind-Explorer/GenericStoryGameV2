<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Files, House, Refresh, FolderOpened, Download, Delete } from '@element-plus/icons-vue'
import { dialogStyling } from '../../scripts/dialog.css'
import { ref } from 'vue';
import MenuBackground from '../../components/MenuBackground.vue';
import PageTitle from '../../components/PageTitle.vue';
import { ElMessage, ElMessageBox, ElScrollbar } from 'element-plus';
import { storiesCollectionManager } from '../../scripts/storiesCollectionManager';
import { StoryInfo, StoryLocation, resolveStoriesFromFS } from '../../scripts/story';
import StoriesListEntry from '../../components/StoriesListEntry.vue';
import { StorySaveManager } from '../../scripts/storySaveManager';

const storiesListDialogVisible = ref(false);
const story_entry_scroll = ref<InstanceType<typeof ElScrollbar>>();
const playableStoriesManager = ref(new storiesCollectionManager(await resolveStoriesFromFS()));

function prepareStoryDeletion(storyInfo: StoryInfo) {
  ElMessageBox.confirm(
    'This action is irreversable.',
    'Are you sure?',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      await StorySaveManager.deleteStory(storyInfo);
      ElMessage({ message: 'Poof.', grouping: true, type: 'success' });
      await playableStoriesManager.value.refreshStoryInfo();
    })
    .catch(() => {
      // silence.
    });
}

async function refreshStoriesList() {
  playableStoriesManager.value.refreshStoryInfo();
  if (story_entry_scroll.value != null) {
    story_entry_scroll.value.setScrollTop(0);
  }
  ElMessage({ message: 'Refreshed', grouping: true, type: 'success' })
}

async function importStory() {
  const importAction = await StorySaveManager.importStory(StoryLocation.Collections);
  if (!importAction) { return }
  await playableStoriesManager.value.refreshStoryInfo();
  ElMessage({ message: 'Imported!', grouping: true, type: 'success' });
}

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Play" subtitle="Pick up where you left off or select one from your collection." />
    <MenuBackground />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button size="large" :icon="VideoPlay" type="primary" plain>Continue</el-button>
          <el-button @click="storiesListDialogVisible = true" size="large" :icon="Files" type="primary" plain>From
            Collection</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <el-dialog :style="dialogStyling" v-model="storiesListDialogVisible" :show-close="false" width="80%" align-center>
      <template #header>
        <h2 class="dialog-center-title">Your Collection</h2>
      </template>
      <Suspense>
        <template #fallback>
          <h1 style="text-align: center; padding: 30px;">Loading...? why is it taking so long</h1>
        </template>
        <div class="stories-list">
          <el-empty id="empty-story-list" v-if="playableStoriesManager.storyInfos.length == 0"
            description="Looks like you've got no stories in your collection!">
            <el-button :icon="Refresh" @click="refreshStoriesList">Refresh</el-button>
            <el-button :icon="FolderOpened" disabled>Import...</el-button>
          </el-empty>
          <el-scrollbar id="story-entry-scroll" ref="story_entry_scroll"
            v-if="playableStoriesManager.storyInfos.length > 0">
            <el-card v-for="storyInfo in playableStoriesManager.storyInfos" shadow="hover" class="story-entry-card">
              <div class="story-entry" :key="storyInfo.entry_point">
                <StoriesListEntry :story-info="storyInfo" />
                <div class="play-button-div">
                  <el-dropdown class="story-entry-dropdown" trigger="click">
                    <el-icon>
                      <More />
                    </el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :icon="Delete"
                          @click="prepareStoryDeletion(storyInfo)">Delete</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button @click="$router.push(`/storyplayback/${(encodeURIComponent(storyInfo.base_dir))}`)"
                    type="success" plain size="large" :icon="VideoPlay" round class="play-button">Play</el-button>
                </div>
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
      </Suspense>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
</style>