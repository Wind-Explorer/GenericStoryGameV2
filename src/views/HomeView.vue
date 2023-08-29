<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Edit, Setting, SwitchButton } from '@element-plus/icons-vue'

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button size="large" :icon="VideoPlay" type="primary" plain>Play</el-button>
          <el-button size="large" :icon="Edit">Create</el-button>
        </el-button-group>
        <el-button size="large" :icon="Setting">Options</el-button>
      </div>
      <el-button size="large" :icon="SwitchButton" type="danger" plain></el-button>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.navigation-button {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 30px;
  bottom: 0;
  left: 0;
  right: 0;
}

.main-navigation-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>