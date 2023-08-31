<script setup lang="ts">
// Scripts for the component
const props = defineProps({
  title: String,
  subtitle: String
})
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="titles">
      <h1>{{ props.title }}</h1>
      <p>{{ props.subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.titles {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 30px;
}

.titles h1 {
  font-size: 45px;
  opacity: 0.65;
}

.titles p {
  font-size: 18px;
  opacity: 0.4;
}
</style>