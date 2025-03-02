<script setup lang="ts">
import Divider from 'primevue/divider';
import { package2Aria2Input } from '@/utils/package-download-links';
import type { ParsedFile } from '@/types';

const onDone = (results: ParsedFile[]) => {
	return new Promise( async () => {
		if (results.length === 0) return;
		await package2Aria2Input(results);
	});
};

defineExpose({ onDone });
</script>

<template>
	<Divider align="left" type="solid">
		<b>Aria2 Input方式</b>
	</Divider>
	<p><strong>非专业人士请使用Aria2 JSON RPC模式</strong><br>
		使用 aria2 命令行输入文件开始下载. (aria2c -i task.txt)<br>
	</p>
</template>

<style scoped>

</style>
