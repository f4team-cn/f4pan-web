<script setup lang="ts">
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import { useUserStore } from '@/store';
import { storeToRefs } from 'pinia';
import type { ParsedFile } from '@/types';
import { packageDownloadLinks } from '@/utils/package-download-links';

const userStore = useUserStore();
const userRef = storeToRefs(userStore);
const exportFormat = userRef.exportFormat;

const onDone = (results: ParsedFile[]) => {
	return new Promise( async () => {
		if (results.length === 0) return;
		await packageDownloadLinks(results, userRef.exportFormat.value);
	});
};

defineExpose({ onDone });

</script>

<template>
	<Divider align="left" type="solid">
		<b>Web</b>
	</Divider>
	<div class="formgrid grid">
		<div class="field col">
			<label for="format">导出格式</label>
			<InputText type="text" placeholder="{filename}-{url}" v-model="exportFormat" />
		</div>
	</div>
</template>

<style scoped>

</style>
