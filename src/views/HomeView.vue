<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Edit, SwitchButton } from '@element-plus/icons-vue'
import { exit } from '@tauri-apps/api/process';
import MenuBackground from '../components/MenuBackground.vue';
import PageTitle from '../components/PageTitle.vue';
import { app } from '@tauri-apps/api';
import { onMounted, ref } from 'vue';
import router from '../router';

const appVersion = ref('');

onMounted(async () => {
  appVersion.value = await app.getVersion();
});

function pageToPlayOptions() {
  router.push('/playoptions');
}

function pageToCreateOptions() {
  router.push('/createoptions');
}

async function quitApp() {
  await exit(1);
}
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Generic Story Game" :subtitle="'Version ' + appVersion" />
    <MenuBackground page="main" />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button @click="pageToPlayOptions" size="large" :icon="VideoPlay" type="primary"
            plain>Play</el-button>
          <el-button @click="pageToCreateOptions" size="large" :icon="Edit" type="primary"
            plain>Create</el-button>
        </el-button-group>
        <!-- To be implemented when there are some settings for the app available. -->
        <!--
        <el-button size="large" :icon="Setting" type="info" plain>Options</el-button>
        -->
      </div>
      <el-button size="large" :icon="SwitchButton" type="danger" plain @click="quitApp"></el-button>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>