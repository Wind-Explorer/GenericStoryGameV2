<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Files, House } from '@element-plus/icons-vue'
import StoriesList from '../../components/StoriesList.vue'
import { dialogStyling } from '../../scripts/dialog.css'
import { ref } from 'vue';

import PageTitle from '../../components/PageTitle.vue';
import AnimatingGradient from '../../components/AnimatingGradient.vue';

const storiesListDialogVisible = ref(false);
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Play" subtitle="Pick up where you left off or select one from your collection." />
    <AnimatingGradient />
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
      <template #title>
        <h2 class="dialog-center-title">Your Collection</h2>
      </template>
      <Suspense>
        <template #fallback>
          <h1 style="text-align: center; padding: 30px;">Loading...? why is it taking so long</h1>
        </template>
        <StoriesList class="stories-list" />
      </Suspense>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
</style>