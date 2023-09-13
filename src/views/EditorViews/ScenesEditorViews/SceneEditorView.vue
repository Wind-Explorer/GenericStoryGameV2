<script setup lang="ts">
import { House, Plus, Select } from '@element-plus/icons-vue';

// Scripts for the component

const props = defineProps({
  sceneDir: String,
})

console.log(props.sceneDir);

</script>

<template>
  <div class="container">
    <!-- HTML elements for the component -->
    <div class="row-grid grid1">
      <el-card class="scene-preferences">
        <div class="scene-preferences-div">
          <el-scrollbar>
            <el-form label-position="top">
              <el-form-item label="Scene name">
                <el-input readonly />
              </el-form-item>
              <el-divider />
              <el-form-item label="Background type">
                <el-radio-group>
                  <el-radio>Color</el-radio>
                  <el-radio>Media</el-radio>
                </el-radio-group>
                <div class="background-type-values">
                  <div v-if="true" class="background-type-values color-picker">
                    <el-input readonly />
                    <el-color-picker />
                  </div>
                  <el-button v-if="false" class="background-type-values media-picker">Change</el-button>
                </div>
              </el-form-item>
              <el-divider />
              <el-form-item label="Navigation type">
                <el-radio-group>
                  <el-radio>Single</el-radio>
                  <el-radio>Multi</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-divider />
              <el-form-item label="Text display">
                <el-radio-group>
                  <el-radio>Narration</el-radio>
                  <el-radio>Attention</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-scrollbar>
          <div class="scene-preferences-actions">
            <el-button type="success" plain :icon="Select">Save</el-button>
            <el-button @click="$router.go(-1)" plain :icon="House" style="width: min-content;" />
          </div>
        </div>
      </el-card>
      <div class="col-grid grid2">
        <div class="row-grid">
          <div id="scene-preview" class="component">
            <div class="scene-preview-background" v-if="true" :style="`background-color: indigo`"></div>
            <img class="scene-preview-background" v-if="false" />
            <p v-if="true" id="scene-preview-narration-text" class="background-neutral-text">narration narration yes yes
            </p>
            <p v-if="true" id="scene-preview-center-text" class="background-neutral-text">center text very centered</p>
            <div v-if="true" id="scene-preview-mcq">
              <div class="mcq-button" v-for="e in 4">
                <p class="background-neutral-text">Action {{ e }}</p>
              </div>
            </div>
            <div v-if="true" id="scene-preview-catc">
              <p>Click anywhere to continue</p>
            </div>
          </div>
        </div>
        <div>
          <el-input v-if="true" class="scene-textarea" id="narration-text" maxlength="300" type="textarea" resize="none"
            :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Narration Text (appears at the top right of the scene)"></el-input>
          <el-input v-if="false" class="scene-textarea" id="center-text" type="textarea" resize="none" maxlength="200"
            :autosize="{ minRows: 2, maxRows: 2 }"
            placeholder="Attention Text (appears at the center of the scene)"></el-input>
        </div>
      </div>
      <div v-if="true" class="mcq-edit component">
        <el-scrollbar>
          <div class="empty-mcq" v-if="true">
            <el-empty description="Click the button below to begin." />
          </div>
          <el-card v-if="false" class="mcq-edit-card" v-for="e in 4">
            <div class="mcq-edit-entry">
              <el-form label-position="top">
                <el-form-item label="Action">
                  <el-input :model-value="e" />
                </el-form-item>
                <el-form-item label="Destination">
                  <div style="display: flex; gap: 5px;">
                    <el-input readonly />
                    <el-button text type="primary">Change</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-scrollbar>
        <div class="add-mcq-div">
          <el-button text bg :icon="Plus">New option</el-button>
        </div>
      </div>
      <el-card v-if="false" class="mcq-edit component">
        <p>Single choice</p>
        <el-divider></el-divider>
        <el-form label-position="top">
          <el-form-item label="Destination">
            <div style="display: flex; gap: 5px;">
              <el-input readonly />
              <el-button text type="primary">Change</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
/* CSS styles for the component */

.container {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
}

.component {
  border: 1px solid #77777777;
  border-radius: 4px;
}

.col-grid {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.row-grid {
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 10px;
}

.grid2 {
  width: 100%;
}


.mcq-button {
  all: unset;
  font-size: 1.5vw;
  padding: 0.15vw 0.5vw;
  font-weight: 400;
  transition: 0.1s;
}

.mcq-edit-card {
  margin: 10px 10px 10px 10px;
}

.mcq-edit-entry {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mcq-edit-entry p {
  opacity: 0.7;
}

.add-mcq-div {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-top: 1px solid #77777733;
}

.add-mcq-div * {
  width: 100%;
}

.background-type-values {
  margin-top: 5px;
  width: 100%;
}

.background-type-values.color-picker {
  display: flex;
  gap: 10px;
}

.background-type-values.media-picker {
  width: 100%;
}

.scene-preferences-div {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* border: 1px solid red; */
  bottom: 20px;
  top: 20px;
  left: 20px;
  right: 20px;
}

.scene-preview-background {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.scene-preferences {
  width: 30vw;
  max-width: 260px;
  min-width: 180px;
  height: 100%;
  position: relative;
}

.scene-preferences-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  border-top: 1px solid #77777733;
  padding-top: 15px;
}

.scene-preferences-actions * {
  width: 100%;
}

.mcq-edit {
  width: 30vw;
  max-width: 300px;
  min-width: 230px;
  display: flex;
  flex-direction: column;
}

.scene-textarea {
  font-size: 24px;
}

.empty-mcq {
  position: relative;
  transform: scale(0.8);
  margin-top: 20vh;
}

#scene-preview {
  width: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
}

#scene-preview-narration-text {
  position: absolute;
  font-size: 1.5vw;
  max-width: 30vw;
  font-weight: 600;
  margin: 2vw;
}

#scene-preview-center-text {
  position: relative;
  font-size: 4vw;
  font-weight: 600;
  width: 100%;
  max-width: 45vw;
  margin: auto 5vw;
  text-align: center;
}

#scene-preview-mcq {
  position: absolute;
  z-index: 10;
  text-align: right;
  display: flex;
  flex-direction: column;
  width: 100%;
  bottom: 1.5vw;
  right: 1.5vw;
  gap: 0.5vw;
}

#scene-preview-catc {
  position: absolute;
  bottom: 1.5vw;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.9vw;
  text-shadow: 0px 0px 0.1vw rgba(0, 0, 0, 1), 0px 0px 0.3vw rgba(0, 0, 0, 0.5), 0px 0px 0.8vw rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  font-weight: 300;
}
</style>