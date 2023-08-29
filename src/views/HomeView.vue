<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Edit, Setting, SwitchButton } from '@element-plus/icons-vue'
import { exit } from '@tauri-apps/api/process';

async function quitApp() {
  await exit(1);
}
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="background-element">
      <img src="../assets/home-bg.png" alt="background" />
    </div>
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button @click="$router.push('/playoptions')" size="large" :icon="VideoPlay" type="primary"
            plain>Play</el-button>
          <el-button size="large" :icon="Edit" type="primary" plain>Create</el-button>
        </el-button-group>
        <el-button size="large" :icon="Setting" type="info" plain>Options</el-button>
      </div>
      <el-button size="large" :icon="SwitchButton" type="danger" plain @click="quitApp"></el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
</style>