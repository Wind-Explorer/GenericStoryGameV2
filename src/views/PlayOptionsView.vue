<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Files, House } from '@element-plus/icons-vue'
import StoriesListView from '../components/StoriesListView.vue'
import { ref } from 'vue';

const storiesListDialogVisible = ref(false);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="background-element">
      <img src="../assets/list-bg.png" alt="background" />
    </div>
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button size="large" :icon="VideoPlay" type="primary" plain>Continue</el-button>
          <el-button @click="storiesListDialogVisible = true" size="large" :icon="Files" type="primary" plain>Stories
            List</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
    <el-dialog v-model="storiesListDialogVisible" :show-close="false" width="80%" align-center>
      <StoriesListView class="stories-list" />
    </el-dialog>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.stories-list {
  height: calc(100vh - 40vh);
  min-height: 350px;
  margin-top: -30px;
}
</style>