<script setup lang="ts">
// Scripts for the component

const props = defineProps({
  sceneDir: String,
})
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <h1>Scene Editor</h1>
    <p>Edit a scene</p>
    <p>{{ props.sceneDir }}</p>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
  margin: 30px;
}
</style>