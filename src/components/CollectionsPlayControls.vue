<script setup lang="ts">
import { PropType, onMounted, ref } from 'vue';
import { StoryInfo } from '../scripts/story';
import { ConsistentDataManager } from '../scripts/consistentDataManager';
import { Delete, RefreshLeft, VideoPlay } from '@element-plus/icons-vue';

// Scripts for the component
const props = defineProps({
  storyInfo: Object as PropType<StoryInfo>,
  playAction: Function,
  deleteAction: Function
})

const continuable = ref<boolean>(false);

onMounted(async () => {
  if (props.storyInfo === undefined) { return; }
  continuable.value = await ConsistentDataManager.storyHasProgress(props.storyInfo);
})
</script>

<template>
  <div class="container play-button-div">
    <el-dropdown class="story-entry-dropdown" trigger="click">
      <el-icon>
        <More />
      </el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-if="continuable" @click="props.playAction!(storyInfo, true)" :icon="RefreshLeft">Start from
            beginning</el-dropdown-item>
          <el-dropdown-item :icon="Delete" @click="props.deleteAction!(storyInfo)">Delete</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button @click="props.playAction!(storyInfo, !continuable)" type="success" plain size="large" :icon="VideoPlay"
      round>{{
        continuable ?
        "Continue" : "Play"
      }}</el-button>
  </div>
</template>

<style scoped>
/* CSS styles for the component */
</style>