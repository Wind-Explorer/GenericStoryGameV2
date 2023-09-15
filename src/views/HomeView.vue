<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Edit, Setting, SwitchButton } from '@element-plus/icons-vue'
import { exit } from '@tauri-apps/api/process';
import MenuBackground from '../components/MenuBackground.vue';
import PageTitle from '../components/PageTitle.vue';

async function quitApp() {
  await exit(1);
}
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Generic Story Game" subtitle="Version 0.5.0" />
    <MenuBackground />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button @click="$router.push('/playoptions')" size="large" :icon="VideoPlay" type="primary"
            plain>Play</el-button>
          <el-button @click="$router.push('/createoptions')" size="large" :icon="Edit" type="primary"
            plain>Create</el-button>
        </el-button-group>
        <el-button size="large" :icon="Setting" type="info" plain>Options</el-button>
      </div>
      <el-button size="large" :icon="SwitchButton" type="danger" plain @click="quitApp"></el-button>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>