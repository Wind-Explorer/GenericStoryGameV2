<script setup lang="ts">
// Scripts for the component
const props = defineProps({
  page: String
})

const classNames = "container " + props.page;
</script>

<template>
  <div :class="classNames" id="bg">
    <!-- HTML elements for the component -->

  </div>
</template>

<style scoped>
/* CSS styles for the component */
#bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.main {
  background: radial-gradient(ellipse at 40% 0%, #ff52ba20 0, transparent 75%), radial-gradient(ellipse at 60% 0%, #0077ff20 0, transparent 75%);
}

.play {
  background: radial-gradient(ellipse at 40% 0%, #ff52ba20 0, transparent 75%), radial-gradient(ellipse at 60% 0%, #ffd90020 0, transparent 75%);
}

.create {
  background: radial-gradient(ellipse at 40% 0%, #ff52ba20 0, transparent 75%), radial-gradient(ellipse at 60% 0%, #00ff4420 0, transparent 75%);
}
</style>