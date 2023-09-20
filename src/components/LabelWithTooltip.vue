<script setup lang="ts">
// Scripts for the component
const props = defineProps({
  label: String,
  tooltip: String
})
</script>

<template>
  <div class="component-container">
    <!-- HTML elements for the component -->
    <el-text>{{ props.label }}</el-text>
    <el-tooltip :content="props.tooltip" placement="top">
      <el-icon class="tooltip-icon">
        <InfoFilled />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
.component-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.component-container * {
  margin-top: auto;
  margin-bottom: auto;
}

.tooltip-icon {
  opacity: 0.5;
}
</style>