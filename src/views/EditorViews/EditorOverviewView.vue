<script setup lang="ts">
import LabelWithTooltip from '../../components/LabelWithTooltip.vue';
import { reactive, ref, watch } from 'vue';
import { ExtraStoryInfo, resolveExtraStoryInfo, resolveScenesFromFS, sceneNameToRelativePath, writeStoryInfoToDisk } from '../../scripts/story';
import { getObjFromPath, openInFileManager, resolveNameOfFileManager, joinPath } from '../../scripts/utils';
import { House, Select } from '@element-plus/icons-vue';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { ElMessage } from 'element-plus';
import { strings } from '../../scripts/strings';

// Scripts for the component

const props = defineProps({
	baseDir: String
})

const storyInfo = reactive<ExtraStoryInfo>(
	await resolveExtraStoryInfo(
		decodeURIComponent(props.baseDir as string)
	)
);

const availableEntryPoints = ref<string[]>([]);
const storyEntryPoint = ref(getObjFromPath(storyInfo.base_story_info.entry_point).replace('.json', ''));

async function populateAvaliableEntryPoints() {
	availableEntryPoints.value = (await resolveScenesFromFS(props.baseDir as string)).map((scene) => {
		return scene.scene_name;
	})
}
populateAvaliableEntryPoints();

watch(storyEntryPoint, (newVal) => {
	storyInfo.base_story_info.entry_point = sceneNameToRelativePath(newVal);
})

async function saveData() {
	await writeStoryInfoToDisk(storyInfo.base_story_info, props.baseDir as string);
	ElMessage({ message: 'Saved', grouping: true, type: 'success' })
}

</script>

<template>
	<div class="container">
		<!-- HTML elements for the component -->
		<el-descriptions :column="1" border size="large">
			<template #title>
				<h1>{{ storyInfo.base_story_info.title }}</h1>
			</template>
			<template #extra>
				<el-button @click="saveData" size="large" type="success" :icon="Select" plain>Save</el-button>
				<el-button @click="$router.go(-1)" size="large" :icon="House" type="info" plain></el-button>
			</template>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Title" tooltip="Name of the story" />
				</template>
				<el-input placeholder="Title" maxlength="69" v-model="storyInfo.base_story_info.title"></el-input>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Description" tooltip="Overview of what the story is about" />
				</template>
				<el-input placeholder="Description" type="textarea" resize="none" maxlength="420"
					:autosize="{ minRows: 2, maxRows: 2 }" v-model="storyInfo.base_story_info.description"></el-input>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Author" tooltip="Name of the person that made the story" />
				</template>
				<el-input placeholder="Title" maxlength="69" v-model="storyInfo.base_story_info.author"></el-input>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Thumbnail" tooltip="A small image icon symbolizing the story visually" />
				</template>
				<div class="thumbnail-entry">
					<div>
						<el-avatar style="box-shadow: 0 0 1px #333;" shape="square" :size="70"
							:src="convertFileSrc(storyInfo.base_story_info.thumbnail)" fit="cover" />
						<el-text size="large">{{ getObjFromPath(storyInfo.base_story_info.thumbnail) }}</el-text>
					</div>
					<div>
						<el-button>Choose from resources...</el-button>
					</div>
				</div>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Resources" tooltip="Visual assets / graphics for the story" />
				</template>
				<div class="resources-entry">
					<el-text size="large">{{ storyInfo.resources_count }} file{{ storyInfo.resources_count > 1 ? 's' : '' }} in the
						resources folder</el-text>
					<el-button @click="openInFileManager(joinPath((baseDir as string), strings.fileNames.resourcesFolder))">{{
						`Manage in
						${resolveNameOfFileManager()}` }}</el-button>
				</div>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Entry Point" tooltip="The first scene to be loaded" />
				</template>
				<div class="entry-point-entry">
					<el-text size="large">Select from your scenes</el-text>
					<el-select v-model="storyEntryPoint">
						<el-option v-for="item in availableEntryPoints" :key="item" :label="item" :value="item" />
					</el-select>
				</div>
			</el-descriptions-item>
			<el-descriptions-item label-align="left" align="left">
				<template #label>
					<LabelWithTooltip label="Scenes" tooltip="A collection of moments that tells the story" />
				</template>
				<div class="resources-entry">
					<el-text size="large">{{ storyInfo.scenes_count }} scene{{ storyInfo.scenes_count > 1 ? 's' : '' }} for the
						story</el-text>
					<el-button @click='$router.push(`/sceneseditor/${encodeURIComponent(storyInfo.base_story_info.base_dir)}`)'
						type="primary">Edit</el-button>
				</div>
			</el-descriptions-item>
		</el-descriptions>
	</div>
</template>

<style scoped>
/* CSS styles for the component */
.container {
	max-width: 800px;
	margin: 30px auto;
	padding: 0 30px;
}

.story-thumbnail {
	width: 100px;
	border-radius: 4px;
}

.thumbnail-entry {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.thumbnail-entry div {
	display: flex;
	flex-direction: row;
	margin-top: auto;
	margin-bottom: auto;
	gap: 15px;
}

.resources-entry {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.entry-point-entry {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
</style>