<script setup lang="ts">
// Scripts for the component
import { toggleDark } from "./composables";
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <button style="display: none;" @click="toggleDark()" />
    <el-header>
      <div class="header-div">
        <el-text size="large">Generic Story Game V2</el-text>
        <el-button>Elemental Button</el-button>
      </div>
    </el-header>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
  margin: 30px;
}

.header-div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>