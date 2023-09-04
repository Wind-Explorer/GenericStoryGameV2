<script setup lang="ts">
// Scripts for the component
import PageTitle from '../../components/PageTitle.vue';
import AnimatingGradient from '../../components/AnimatingGradient.vue';
import { dialogStyling } from '../../scripts/dialog.css'
import { Plus, Files, House } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue';
import { StoryInfo } from '../../scripts/story';

const newStoryDialogVisible = ref(false);
const newStoryInfo = reactive<StoryInfo>({
  title: '',
  description: '',
  author: '',
  creation_date: new Date(),
  thumbnail: '',
  entry_point: '',
  base_dir: ''
});
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Create" subtitle="Tell a story the way you want." />
    <AnimatingGradient />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button @click="newStoryDialogVisible = true" size="large" :icon="Plus" type="primary" plain>New</el-button>
          <el-button size="large" :icon="Files" type="primary" plain>From Workspace</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <el-dialog :style="dialogStyling" v-model="newStoryDialogVisible" :show-close="false" width="80%" align-center>
      <template #header>
        <h2 class="new-story-title">New story</h2>
      </template>
      <el-form :model="newStoryInfo" label-width="200px" label-position="top">
        <el-form-item :required="true" label="Title for your new story">
          <el-input v-model="newStoryInfo.title" size="large" maxlength="69"
            placeholder="my ridiculous experience today" />
        </el-form-item>
        <el-form-item label="A bit more details about it?">
          <el-input v-model="newStoryInfo.description" type="textarea" maxlength="420"
            placeholder="find out how I did that one crazy thing at that place" />
        </el-form-item>
        <el-form-item label="Name of the one authoring it">
          <el-input v-model="newStoryInfo.author" maxlength="100" placeholder="A mysterious someone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="newStoryDialogVisible = false">
          Create
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.new-story-title {
  text-align: center;
}
</style>