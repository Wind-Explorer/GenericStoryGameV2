<script setup lang="ts">
// Scripts for the component
import { toggleDark } from "./composables";
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <button style="display: none;" @click="toggleDark()" />
    <RouterView />
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>