<script setup lang="ts">
// Scripts for the component
import { VideoPlay, Files, House } from '@element-plus/icons-vue'

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
          <el-button size="large" :icon="Files" type="primary" plain>Stories List</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
</style>