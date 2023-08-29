<script setup lang="ts">
// Scripts for the component
import { toggleDark } from "./composables";
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <button style="display: none;" @click="toggleDark()" />
    <RouterView v-slot="{ Component }">
      <Transition name="transition" mode="out-in">
        <component :is="Component"></component>
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.transition-enter-active,
.transition-leave-active {
  transition: 0.4s;
}

.transition-enter-from,
.transition-leave-to {
  opacity: 0;
  transform-origin: center;
}
</style>