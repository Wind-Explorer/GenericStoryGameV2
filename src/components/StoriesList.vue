<script setup lang="ts">
// Scripts for the component
import { VideoPlay } from '@element-plus/icons-vue';
import { appDataDir } from '@tauri-apps/api/path';
import { createDir, exists, readDir } from '@tauri-apps/api/fs';

const appDataDirPath = await appDataDir();

async function readAppDataDir() {
  console.log(`App data directory location:\n${appDataDirPath}`);

  if (!await exists(appDataDirPath)) {
    createDir(appDataDirPath);
  }

  const appDataDirContent = await readDir(appDataDirPath);

  console.log("Content of app data directory:");
  for (var entry in appDataDirContent) {
    console.log(appDataDirContent[entry].name);
  }
}

readAppDataDir();

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <el-scrollbar>
      <el-card v-for="o in 4" shadow="hover" class="story-entry-card">
        <div class="story-entry" :key="o">
          <div class="story-info">
            <h2>{{ 'Generic Story Title ' + o }}</h2>
            <h4>{{ 'By generic author ' + o }}</h4>
          </div>
          <el-button type="primary" plain :icon="VideoPlay" class="play-button"></el-button>
        </div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
html.dark {
  .stories-list {
    background-color: #181818;
  }
}

.story-entry-card {
  margin: 15px;
}

.story-entry {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 60px;
}

.play-button {
  font-size: 30px;
  height: 100%;
}

.story-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-top: auto;
  margin-bottom: auto;
  gap: 5px;
}

.story-info h4 {
  opacity: 0.7;
}
</style>