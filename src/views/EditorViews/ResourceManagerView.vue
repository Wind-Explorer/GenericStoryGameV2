<script setup lang="ts">
// Scripts for the component
const props = defineProps({
  baseDir: String
})
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <h1>Resource Manager</h1>
    <p>{{ props.baseDir }}</p>
    <el-button @click="$router.go(-1)">back</el-button>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
  margin: 30px;
}
</style>