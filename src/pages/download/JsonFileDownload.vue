<script setup lang="ts">
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import { package2JsonFile } from '@/utils/package-download-links';
import type { ParsedFile } from '@/types';

const onDone = (results: ParsedFile[]) => {
	return new Promise(async () => {
		if (results.length === 0) return;
		await package2JsonFile(results);
	});
};

defineExpose({ onDone });
</script>

<template>
	<Divider align="left" type="solid">
		<b>导出为 JSON 文件</b>
	</Divider>
	<Message :closable="false" severity="info">
		本下载方式生成了一个 JSON 文件，开发者可基于本数据二次开发。
	</Message>
</template>

<style scoped>

</style>
