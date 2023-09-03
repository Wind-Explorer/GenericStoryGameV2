<script setup lang="ts">
// Scripts for the component
import PageTitle from '../../components/PageTitle.vue';
import AnimatingGradient from '../../components/AnimatingGradient.vue';
import { Plus, Files, House } from '@element-plus/icons-vue'
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <PageTitle title="Create" subtitle="Tell a story the way you want." />
    <AnimatingGradient />
    <div class="navigation-button">
      <div class="main-navigation-buttons">
        <el-button-group>
          <el-button size="large" :icon="Plus" type="primary" plain>New</el-button>
          <el-button size="large" :icon="Files" type="primary" plain>From workspace</el-button>
        </el-button-group>
      </div>
      <el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>