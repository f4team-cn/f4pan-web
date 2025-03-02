<script setup lang="ts">
import allowAlwaysOpenImage from '@/assets/allow-always-open.png';
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Image from 'primevue/image';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
import { addUri, waken } from '@/utils/motrix';
import { useUserStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useMessage } from '@/hooks/useMessage';
import type { WorkerResponse } from '@/types';

const motrixProtocolLoading = ref(false);
const userStore = useUserStore();
const userRef = storeToRefs(userStore);
const rpcRef = userRef.rpc;
const message = useMessage();

const wakenMotrixClient = async () => {
	motrixProtocolLoading.value = true;
	await waken();
	message.default('已发起唤起 Motrix 客户端请求，如果没有唤起客户端，请确保安装了支持该协议的版本。');
	motrixProtocolLoading.value = false;
};

const onSuccess = (response: WorkerResponse, rootDir: string | undefined, fileDir: string | undefined) => {
	return new Promise(async (resolve) => {
		await addUri(response!!.body!!.dlink, response!!.body!!.filename, fileDir);
		resolve(null);
	});
};

defineExpose({ onSuccess });
</script>

<template>
	<Divider align="left" type="solid">
		<b>Motrix Deep Links</b>
	</Divider>
	<p><strong>Motrix Deep Links</strong> 是<strong>F4Team</strong>对<strong>Motrix</strong>客户端进行修改并增加的一个功能，它通过
		URL Scheme 与<strong>Motrix</strong>进行通信，该功能现暂未提交到<strong>Motrix</strong>官方仓库，请前往我们
		<a href="https://github.com/f4team-cn/f4team-motrix" target="_blank"><strong>仓库(https://github.com/f4team-cn/f4team-motrix)</strong></a>
		的 Releases 中下载。</p>
	<Message :closable="false">
		为了更好的体验，如果弹出了如下的对话框，请<strong>勾选【始终允许】</strong>，最后点击打开即可！
	</Message>
	<Card>
		<template #content>
			<Image :src="allowAlwaysOpenImage" height="150" width="320" preview />
		</template>
	</Card>
	<div class="formgrid grid">
		<div class="field col">
			<Button label="测试唤起" style="margin-top: 25px;" id="driver-step-test-json-rpc"
			        :loading="motrixProtocolLoading"
			        @click="wakenMotrixClient"></Button>
		</div>
	</div>
	<Message :closable="false" severity="warn">值得注意的是，使用本下载方式，依然需要更改下载目录，即本下载方式和<strong>Aria2
		JSON RPC</strong>的下载目录数据通用，你可以先选择<strong>Aria2 JSON RPC</strong>下载方式，获取默认配置后再切换回本下载方式，即可获取Motrix中已经配置的下载目录，你也可以在下方输入框中手动输入下载目录。
	</Message>
	<div class="formgrid grid">
		<div class="field col">
			<label for="basedir">下载目录(最好不要留空)</label>
			<InputText type="text" placeholder="" v-model="rpcRef.basedir" />
		</div>
	</div>

</template>

<style scoped>

</style>
