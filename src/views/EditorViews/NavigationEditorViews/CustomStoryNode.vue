<script setup>
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  // scene: SceneInfo, nodetype: "input" | "output" | "default"
  data: {
    type: Object,
    required: true,
  },
  isValidSourcePos: {
    type: Function,
    required: false,
  },
})
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<template>
  <Handle type="target" :position="Position.Top" v-if="props.data.nodetype == 'output' || props.data.nodetype == 'default'"  />
  <Handle type="source" :position="Position.Bottom" v-if="props.data.nodetype == 'input' || props.data.nodetype == 'default'" :is-valid-connection="props.isValidSourcePos" />

  <div class="node node-customnode">{{ props.label }}</div>
</template>

<style scoped>
.vue-flow__handle-connecting{background:#ff6060}
.vue-flow__handle-valid{background:#55dd99}
.node{width:150px;border-radius:5px;padding:10px;color:#555;border:1px solid #ddd;text-align:center;font-size:12px}
.node-customnode{background:#e6e6e9;border:1px solid #ddd}
</style>
