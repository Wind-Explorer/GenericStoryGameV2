<script setup lang="ts">
// Scripts for the component
import PageTitle from '../../components/PageTitle.vue';
import { dialogStyling } from '../../scripts/dialog.css'
import { Plus, Files, House, Edit, More, Refresh, FolderOpened, Delete, Upload, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, watch } from 'vue';
import { StoryInfo, StoryLocation, resolveStoriesFromFS } from '../../scripts/story';
import StoriesListEntry from '../../components/StoriesListEntry.vue';
import MenuBackground from '../../components/MenuBackground.vue';
import { sanitizeFileName } from '../../scripts/utils';
import { StoryCreator } from '../../scripts/storyCreator';
import { StorySaveManager } from '../../scripts/storySaveManager';

const newStoryDialogVisible = ref(false);
const storiesListDialogVisible = ref(false);

interface NewStoryInfo {
  title: string,
  description: string,
  author: string
}

const newStoryInfo = ref<NewStoryInfo>({
  title: '',
  description: '',
  author: ''
});

const storyCreator = ref(new StoryCreator(await resolveStoriesFromFS(StoryLocation.Workspace)));

async function prepareNewStoryCreation() {
  await storyCreator.value.createNewStory(
    newStoryInfo.value.title.trim(),
    newStoryInfo.value.description.trim(),
    newStoryInfo.value.author.trim()
  );
  newStoryDialogVisible.value = false;
  ElMessage({ message: 'Created!', grouping: true, type: 'success' });
}

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
      await storyCreator.value.refreshStoryInfos();
    })
    .catch(() => {
      // silence.
    });
}

async function refreshStoryInfos() {
  await storyCreator.value.refreshStoryInfos();
  ElMessage({ message: 'Refreshed!', grouping: true, type: 'success' });
}

async function importStory() {
  const importAction = await StorySaveManager.importStory(StoryLocation.Workspace);
  if (!importAction) { return }
  await storyCreator.value.refreshStoryInfos();
  ElMessage({ message: 'Imported!', grouping: true, type: 'success' });
}

watch(newStoryInfo.value, () => {
  newStoryInfo.value.title = sanitizeFileName(newStoryInfo.value.title);
});
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Create" subtitle="Tell a story the way you want." />
    <MenuBackground />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button @click="newStoryDialogVisible = true" size="large" :icon="Plus" type="primary" plain>New</el-button>
          <el-button @click="storiesListDialogVisible = true" size="large" :icon="Files" type="primary" plain>From
            Workspace</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <el-dialog :style="dialogStyling" v-model="newStoryDialogVisible" :show-close="false" width="80%" align-center>
      <template #header>
        <h2 class="dialog-center-title">New story</h2>
      </template>
      <el-form :model="newStoryInfo" label-width="200px" label-position="top">
        <el-form-item :required="true" label="Title for your new story">
          <el-input v-model="newStoryInfo.title" size="large" maxlength="69"
            placeholder="my ridiculous experience today" />
        </el-form-item>
        <el-form-item label="A bit more details about it?">
          <el-input v-model="newStoryInfo.description" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }"
            resize="none" maxlength="420" placeholder="find out how I did that one crazy thing at that place" />
        </el-form-item>
        <el-form-item label="Name of the one authoring it">
          <el-input v-model="newStoryInfo.author" maxlength="100" placeholder="A mysterious someone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="newStoryInfo.title.length <= 0" type="primary" @click="prepareNewStoryCreation">
          Create
        </el-button>
      </template>
    </el-dialog>
    <el-dialog :style="dialogStyling" v-model="storiesListDialogVisible" :show-close="false" width="80%" align-center>
      <template #header>
        <h2 class="dialog-center-title">Your Workspace</h2>
      </template>
      <!-- <EditorStoriesList class="stories-list" /> -->
      <div class="stories-list">
        <el-empty id="empty-story-list" v-if="storyCreator.storyInfos.length == 0"
          description="Looks like you've got no stories in your workspace!">
          <el-button :icon="Refresh" @click="storyCreator.refreshStoryInfos()">Refresh</el-button>
          <el-button :icon="FolderOpened" disabled>Import...</el-button>
        </el-empty>
        <el-scrollbar id="story-entry-scroll" ref="story_entry_scroll" v-if="storyCreator.storyInfos.length > 0">
          <el-card v-for="storyInfo in storyCreator.storyInfos" shadow="hover" class="story-entry-card">
            <div class="story-entry" :key="storyInfo.entry_point">
              <StoriesListEntry :story-info="storyInfo" />
              <div class="play-button-div">
                <el-dropdown class="story-entry-dropdown" trigger="click">
                  <el-icon>
                    <More />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Upload"
                        @click="StorySaveManager.exportStory(storyInfo)">Export...</el-dropdown-item>
                      <el-dropdown-item :icon="Delete" @click="prepareStoryDeletion(storyInfo)">Delete</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button @click="$router.push(`/editoroverview/${(encodeURIComponent(storyInfo.base_dir))}`)"
                  type="primary" plain size="large" :icon="Edit" round class="play-button">Edit</el-button>
              </div>
            </div>
          </el-card>
          <div class="list-bottom">
            <el-button id="refresh-button" class="list-bottom-button" :icon="Refresh"
              @click="refreshStoryInfos()">Refresh</el-button>
            <el-button id="import-button" class="list-bottom-button" :icon="Download"
              @click="importStory()">Import</el-button>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>