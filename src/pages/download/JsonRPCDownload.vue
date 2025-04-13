<script setup lang="ts">
import { useSystemConfigStore, useUserStore } from '@/store';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useMessage } from '@/hooks/useMessage';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import type { WorkerResponse } from '@/types';
import Aria2RpcClient from '@/utils/aria2';
import Tag from 'primevue/tag';
import { useLogger } from '@/hooks/useLogger';

let aria2Client: Aria2RpcClient | undefined = undefined;
const userStore = useUserStore();
const system = useSystemConfigStore();
const userRef = storeToRefs(userStore);
const rpcRef = userRef.rpc;
const rpcInit = ref(false);
const message = useMessage();
const { log } = useLogger();
const rpcConnectionState = reactive({
	ws: false,
	test: false
});
const transmissionProtocol = computed<{ code: 'http' | 'https' | 'ws' | 'wss' }>({
	get: () => ({ code: rpcRef.value.type, name: rpcRef.value.type.toUpperCase() }),
	set: (value) => rpcRef.value.type = value.code
});
const rpcConnection = computed<boolean>(() => rpcConnectionState.ws && rpcConnectionState.test);

const getRPConfig = async () => {
	if (!rpcConnection.value) {
		message.warn('请先连接 Aria2 客户端。');
		return;
	}
	rpcInit.value = true;
	const body = await aria2Client?.call('aria2.getGlobalOption', []);
	if (!body) {
		log('获取 Aria2 客户端 配置失败', 'error');
		message.warn('获取 Aria2 客户端 配置失败！');
		return;
	}
	const info = body.result as Record<string, string>;
	if (info.dir) {
		rpcRef.value.basedir = info.dir;
		message.success('获取 Aria2 客户端 配置成功！');
	}
	rpcInit.value = false;
};

const onSuccess = (response: WorkerResponse, rootDir: string | undefined, fileDir: string | undefined) => {
	if (!rpcConnection.value) {
		message.error('请先连接 Aria2 客户端。');
		return;
	}
	log(`推送 ${response!!.body!!.filename} 到 Aria2 客户端 `);
	const basedir = userStore.rpc.basedir.replace(/\/$/, '');
	const params = [[response!!.body!!.dlink],
		{
			out: response!!.body!!.filename,
			header: [`User-Agent: ${system.parse_ua}`],
			dir: `${basedir}/${fileDir}`
		}];
	aria2Client?.call(Aria2RpcClient.AddUriAction, params).then(() => {
		log(`成功推送 ${response!!.body!!.filename} 到 Aria2 客户端！`, 'success');
		message.success(`成功推送 ${response!!.body!!.filename} 到 Aria2 客户端！`);
	}).catch(() => {
		message.warn(`推送 ${response!!.body!!.filename} 到 Aria2 客户端失败。`);
		log(`推送 ${response!!.body!!.filename} 到 Aria2 客户端失败。`, 'warning');
	});
};

const initClient = () => {
	if (aria2Client) nullClient();
	log('初始化 Aria2 连接');
	aria2Client = new Aria2RpcClient({
		host: rpcRef.value.host,
		port: parseInt(rpcRef.value.port),
		ssl: ['https', 'wss'].includes(transmissionProtocol.value.code),
		token: rpcRef.value.token,
		protocol: transmissionProtocol.value.code.startsWith('http') ? 'http' : 'ws'
	});
	aria2Client.onOpen = () => {
		rpcConnectionState.ws = true;
	};
	aria2Client.onClose = () => {
		rpcConnectionState.ws = false;
	};
};

const nullClient = () => {
	if (aria2Client) {
		aria2Client?.close();
		aria2Client = undefined;
	}
};

const toggleRpcConnection = async () => {
	if (rpcConnection.value) {
		log('关闭 Aria2 Client', 'warning');
		aria2Client?.close();
		rpcConnectionState.ws = false;
		rpcConnectionState.test = false;
	} else {
		log('创建 Aria2 Client', 'warning');
		rpcInit.value = true;
		try {
			await aria2Client?.init();
		} catch (e: any) {
			log(e?.message ?? '未知的 Aria2 Client 错误', 'error');
			message.error(e?.message);
			rpcInit.value = false;
			return;
		}
		const response = await aria2Client?.call(Aria2RpcClient.VersionAction, []);
		if (response) {
			rpcConnectionState.test = true;
		} else {
			message.warn('连接到 Aria2 客户端失败，请查看控制台。');
		}
		rpcInit.value = false;
	}
};

defineExpose({ onSuccess });

onMounted(() => {
	initClient();
});

onUnmounted(() => {
	nullClient();
});

watch(transmissionProtocol, () => {
	initClient();
});

watch(rpcConnection, (v) => {
	if (v) {
		message.success('连接到 Aria2 成功！');
	} else {
		message.warn('断开 Aria2 连接！');
	}
});
</script>

<template>
	<Divider align="left" type="solid">
		<b>JSON RPC •</b>
		<Tag class="ml-1" severity="success" value="连接成功"
		     v-if="rpcConnection"></Tag>
		<Tag class="ml-1" severity="danger" value="连接断开" v-else></Tag>
	</Divider>
	<div class="formgrid grid">
		<div class="field col">
			<label for="type">通信协议</label>
			<Dropdown :disabled="rpcConnection || rpcInit" v-model="transmissionProtocol" :options="[{name: 'HTTP', code: 'http'},
									          {name: 'HTTPS', code: 'https'},
									          {name: 'WS', code: 'ws'},
									          {name: 'WSS', code: 'wss'}]"
			          optionLabel="name" placeholder="选择通信协议" />
		</div>
		<div class="field col">
			<label for="host">主机</label>
			<InputText type="text" placeholder="localhost" v-model="rpcRef.host"
			           :disabled="rpcConnection || rpcInit" />
		</div>
		<div class="field col">
			<label for="port">端口</label>
			<InputText type="number" placeholder="6800" v-model="rpcRef.port" :disabled="rpcConnection || rpcInit" />
		</div>
	</div>
	<div class="formgrid grid">
		<div class="field col">
			<label for="token">密钥</label>
			<InputText type="text" v-model="rpcRef.token" :disabled="rpcConnection || rpcInit" />
		</div>
		<div class="field col">
			<Button :label="rpcConnection ? '断开' : '连接'" style="margin-top: 25px;" id="driver-step-test-json-rpc"
			        :loading="rpcInit"
			        @click="toggleRpcConnection"></Button>
		</div>
	</div>
	<div class="formgrid grid">
		<div class="field col">
			<label for="basedir">下载目录(最好不要留空)</label>
			<InputText type="text" placeholder="" v-model="rpcRef.basedir" />
		</div>
		<div class="field col">
			<Button label="获取配置" style="margin-top: 25px;" id="driver-step-test-json-rpc"
			        :loading="rpcInit"
			        @click="getRPConfig"></Button>
		</div>
	</div>
	<Divider></Divider>
	<p>下载目录为在操作系统中目录，而不是网盘目录，如果留空可能会现在在操作系统的根目录，如果不知道当前配置的下载目录，可以点击【获取配置】来自动获取。<br>
		<strong>例如：</strong><br>
		下载目录是：D:/下载<br>
		选择的文件夹是：/视频/a.mp4<br>
		那么下载地址是：D:/下载/视频/a.mp4<br>
		<strong>保存的文件夹和您分享出的文件的根目录有关，和您网盘的存储路径无关。</strong>
	</p>
</template>

<style scoped>

</style>
