<script setup lang="ts">
// Scripts for the component
import { toggleDark } from "./composables";
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <button style="display: none;" @click="toggleDark()" />
    <div class="background-div"></div>
    <Suspense>
      <template #fallback>
        <h1>Loading...</h1>
      </template>
      <RouterView v-slot="{ Component }">
        <Transition name="transition" mode="out-in">
          <component :is="Component"></component>
        </Transition>
      </RouterView>
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
.background-div {
  background-color: #f7f7f7;
  z-index: -100;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

html.dark {
  .background-div {
    background-color: #171717;
  }
}

.transition-enter-active,
.transition-leave-active {
  transition: 0.3s;
}

.transition-enter-from,
.transition-leave-to {
  opacity: 0;
}
</style>