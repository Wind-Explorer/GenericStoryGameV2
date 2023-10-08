<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Files, House, Refresh, FolderOpened, Download, Delete } from '@element-plus/icons-vue'
import { dialogStyling } from '../../scripts/dialog.css'
import { onMounted, ref } from 'vue';
import MenuBackground from '../../components/MenuBackground.vue';
import PageTitle from '../../components/PageTitle.vue';
import { ElMessage, ElMessageBox, ElScrollbar } from 'element-plus';
import { storiesCollectionManager } from '../../scripts/storiesCollectionManager';
import { StoryInfo, StoryLocation, resolveStoriesFromFS, resolveStoryInfo } from '../../scripts/story';
import StoriesListEntry from '../../components/StoriesListEntry.vue';
import { StorySaveManager } from '../../scripts/storySaveManager';
import { ConsistentDataManager } from '../../scripts/consistentDataManager';
import { exists } from '@tauri-apps/api/fs';

const storiesListDialogVisible = ref(false);
const notContinuable = ref<boolean>(true);
const continuableStoryName = ref<string>("");
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

async function continueStory() {
  if (notContinuable.value) { return }
  const lastOpenedStoryPath = (await ConsistentDataManager.safeResolveConsistentData()).lastOpenedStoryPath;
  if (lastOpenedStoryPath != null && await exists(lastOpenedStoryPath)) {
    const storyToBeContinued = await resolveStoryInfo(lastOpenedStoryPath);
    await playableStoriesManager.value.playbackStory(storyToBeContinued);
  } else {
    ElMessage({ message: 'Oops! The story seems to be missing.', grouping: true, type: 'error' });
  }
}

onMounted(async () => {
  // If `continuable()` is true, `notContinuable` would be false. Vise versa.
  // Why `notContinuable` you asked? Well a button has a `disabled` property, not `enabled` property.
  notContinuable.value = !(await ConsistentDataManager.continuable());
  continuableStoryName.value = await ConsistentDataManager.continuableStoryName() ?? '';
})

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Play" subtitle="Pick up where you left off or select one from your collection." />
    <MenuBackground />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button :disabled="notContinuable" @click="continueStory()" size="large" :icon="VideoPlay" type="primary"
            plain>Last played{{ continuableStoryName!.length > 0 ? ':' : '' }} {{ continuableStoryName }}</el-button>
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
            <el-button :icon="FolderOpened" @click="importStory()">Import...</el-button>
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
                  <el-button @click="playableStoriesManager.playbackStory(storyInfo)" type="success" plain size="large"
                    :icon="VideoPlay" round class="play-button">Play</el-button>
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
</style>../../scripts/consistentDataManager