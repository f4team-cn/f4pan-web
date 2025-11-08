<script setup lang="ts">
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import type { WorkerResponse } from '@/types';
import { useMessage } from '@/hooks/useMessage';

const message = useMessage();

const onSuccess = (_response: WorkerResponse, _rootDir: string | undefined, _fileDir: string | undefined) => {
	return new Promise(async (resolve) => {
		resolve(null);
	});
};

const isValid = () => {
	message.warn('很抱歉，Vortex方式请下载客户端后使用。');
	return false;
};

const goVortex = (): void => {
	window.open('https://docs.f4team.cn/vortex', '_blank');
};

defineExpose({ onSuccess, isValid });
</script>

<template>
	<Divider align="left" type="solid">
		<b>Vortex</b>
	</Divider>
	<p><strong>Vortex</strong>是<u>F4Team</u>开发的新型下载器，并深度集成了<strong>F4Pan</strong>，快速使用F4Pan。点击下方按钮前往
		Vortex 官网。</p>
	<div class="formgrid grid">
		<div class="field col">
			<Button label="Vortex 官网" style="margin-top: 25px;" @click="goVortex"></Button>
		</div>
	</div>
</template>

<style scoped>

</style>
