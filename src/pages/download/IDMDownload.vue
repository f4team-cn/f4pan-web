<script setup lang="ts">
import Divider from 'primevue/divider';
import type { ParsedFile } from '@/types';
import { package2IDMLinks } from '@/utils/package-download-links';

const onDone = (results: ParsedFile[]) => {
	return new Promise( async () => {
		if (results.length === 0) return;
		await package2IDMLinks(results);
	});
};

defineExpose({ onDone });
</script>

<template>
	<Divider align="left" type="solid">
		<b>IDM 下载导入说明</b>
	</Divider>
	<p>压缩包内会生成一个 ef2 格式的文件，仅可在<strong>电脑版IDM</strong>中使用。<br>
		打开IDM，点击右上角<strong>任务</strong>——<strong>导入</strong>——<strong>从"IDM导出文件"导入</strong><br>
		此功能会自动帮你设置UA，无需在IDM设置中更改。<br>
	</p>
</template>

<style scoped>

</style>
