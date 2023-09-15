<script setup lang="ts">
// Scripts for the component
import PageTitle from '../../components/PageTitle.vue';
import EditorStoriesList from '../../components/EditorStoriesList.vue';
import { dialogStyling } from '../../scripts/dialog.css'
import { Plus, Files, House } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue';
import { createNewStory } from '../../scripts/story';

import MenuBackground from '../../components/MenuBackground.vue';

const newStoryDialogVisible = ref(false);
const storiesListDialogVisible = ref(false);

interface NewStoryInfo {
  title: string,
  description: string,
  author: string
}

const newStoryInfo = reactive<NewStoryInfo>({
  title: '',
  description: '',
  author: ''
});

async function prepareNewStoryCreation() {
  await createNewStory(
    newStoryInfo.title.trim(),
    newStoryInfo.description.trim(),
    newStoryInfo.author.trim()
  );
  newStoryDialogVisible.value = false;
}
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
        <el-button type="primary" @click="prepareNewStoryCreation">
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