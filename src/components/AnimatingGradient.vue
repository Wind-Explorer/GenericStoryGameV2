<script setup lang="ts">
// Scripts for the component
</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="blobs"></div>
    <!-- <div class="blobs"></div>
    <div class="blobs"></div>
    <div class="blobs"></div> -->
  </div>
</template>

<style scoped lang="scss">
/* CSS styles for the component */
.blobs {
  z-index: -1;
  width: 100vw;
  height: 100vh;
  -webkit-animation: AnimationName 20s ease infinite;
  -moz-animation: AnimationName 20s ease infinite;
  animation: AnimationName 20s ease infinite;
  position: absolute;
  top: 0;
  background: linear-gradient(268deg, #50ffbb, #ff9df3, #97c7ff);
  background-size: 600% 600%;
  
  filter: brightness(120%);
  // box-shadow: inset 0 0 10px #000000, inset 0 0 50px #000000;
}

html.dark {
  .blobs {
    filter: brightness(30%);
  }
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}



@-webkit-keyframes AnimationName {
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

@-moz-keyframes AnimationName {
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

@keyframes AnimationName {
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