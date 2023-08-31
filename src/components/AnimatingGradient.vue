<script setup lang="ts">
// Scripts for the component
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="gradient-element"></div>
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
.gradient-element {
  z-index: -1;
  width: 100vw;
  height: 100vh;
  -webkit-animation: GradientRotate 20s ease infinite;
  -moz-animation: GradientRotate 20s ease infinite;
  animation: GradientRotate 20s ease infinite;
  position: absolute;
  top: 0;
  background: linear-gradient(268deg, #50ffbb, #ff9df3, #97c7ff);
  background-size: 600% 600%;

  filter: brightness(120%);
}

html.dark {
  .gradient-element {
    filter: brightness(30%);
  }
}

@-webkit-keyframes GradientRotate {
  0% {
    background-position: 0% 52%
  }

  50% {
    background-position: 100% 49%
  }

  100% {
    background-position: 0% 52%
  }
}

@-moz-keyframes GradientRotate {
  0% {
    background-position: 0% 52%
  }

  50% {
    background-position: 100% 49%
  }

  100% {
    background-position: 0% 52%
  }
}

@keyframes GradientRotate {
  0% {
    background-position: 0% 52%
  }

  50% {
    background-position: 100% 49%
  }

  100% {
    background-position: 0% 52%
  }
}
</style>