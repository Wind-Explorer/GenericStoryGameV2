<script setup lang="ts">
// Scripts for the component
import PageTitle from '../../components/PageTitle.vue';
import EditorStoriesList from '../../components/EditorStoriesList.vue';
import { dialogStyling } from '../../scripts/dialog.css'
import { Plus, Files, House } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import { createNewStory } from '../../scripts/story';

import MenuBackground from '../../components/MenuBackground.vue';
import { sanitizeFileName } from '../../scripts/utils';

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

async function prepareNewStoryCreation() {
  await createNewStory(
    newStoryInfo.value.title.trim(),
    newStoryInfo.value.description.trim(),
    newStoryInfo.value.author.trim()
  );
  newStoryDialogVisible.value = false;
  ElMessage({ message: 'Created!', grouping: true, type: 'success' });
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
      <EditorStoriesList class="stories-list" />
    </el-dialog>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>