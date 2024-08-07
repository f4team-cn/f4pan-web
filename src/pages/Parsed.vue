<script setup lang="ts">
import Fieldset from 'primevue/fieldset';
import BlockUI from 'primevue/blockui';
import ProgressBar from 'primevue/progressbar';
import Tree from 'primevue/tree';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import ButtonGroup from 'primevue/buttongroup';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {storeToRefs} from 'pinia';
import {useCacheStore, useUserStore} from '@/store';
import {useMessage} from '@/hooks/useMessage';
import {useRoute, useRouter} from 'vue-router';
import {useWorker} from '@/hooks/useWorker';
import {renderSize} from '@/utils/render-size';
import {sendToRPC} from '@/utils/send-to-rpc';
import {packageDownloadLinks} from '@/utils/package-download-links';
import {getFileList} from '@/services/parse';
import {dealFileList} from '@/utils/deal-file-list';
import type {ParsedFile, ShareInfo, TreeFileInfo, WorkerRequestBody, WorkerResponse} from '@/types';
import type {TreeNode} from 'primevue/treenode';
import {testJsonrpc} from '@/utils/test-jsonrpc';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {actionTwo} from '@/utils/show-driver';
import delay from '@/utils/delay';

const route = useRoute();
const router = useRouter();
const blocked = ref(true);
const requestId = route.params.reqId as string;
const surl = route.params.surl as string;
const pwd = route.params.pwd as string;
const filesRef = ref<TreeFileInfo[] | undefined>(undefined);
const diskRoot = ref<string | undefined>(undefined);
const message = useMessage();
const treeLoading = ref(false);
const selectedFilesOrigin = ref([]);
const selectedFiles = ref<TreeFileInfo[]>([]);
const starting = ref(false);
const shareInfo = ref<ShareInfo>({seckey: '', share_id: '', uk: ''});
const worker = useWorker();
const userStore = useUserStore();
const userRef = storeToRefs(userStore);
const rpcRef = userRef.rpc;
const exportFormat = userRef.exportFormat;
const downloadType = ref<{
	code: 'web' | 'jsonrpc' | ''
}>({
	code: ''
});
const progress = ref(0);
const results: ParsedFile[] = [];

const onNextStep = async (element: Element | undefined) => {
	if (element && element.id === 'driver-step-select-download-type') {
		downloadType.value.code = 'jsonrpc';
	} else {
		downloadType.value.code = '';
	}
	await delay(120);
};

onMounted(async () => {
	try {
		const {data: response} = await getFileList(requestId, undefined);
		const {data} = response;
		const files = data.list;
		const {root, tree} = dealFileList(files);
		shareInfo.value = data.shareinfo;
		diskRoot.value = root;
		filesRef.value = tree;
		blocked.value = false;
		if (window.localStorage.getItem('driver-step-done') !== 'true') {
			actionTwo(onNextStep);
		}
	} catch (e) {
		console.error(e);
		message.error('数据出错！请重新解析！');
		router.back();
	}
});

const onNodeExpand = async (node: TreeNode) => {
	if (node.children) return;
	node.loading = true;
	try {
		const {data: response} = await getFileList(requestId, node.path);
		const {data} = response;
		const files = data.list;
		const {tree} = dealFileList(files);
		node.children = tree;
	} catch {
		message.error('打开文件夹出错！');
	} finally {
		node.loading = false;
	}
};
// 过滤选择文件夹 （只选择文件）
const onNodeSelect = (node: TreeNode & TreeFileInfo) => {
	if (!node.leaf) return;

	const found = selectedFiles.value.find(v => v.fs_id === node.fs_id);
	if (!found) {
		selectedFiles.value.push(node);
	}
};
const onNodeUnSelect = (node: TreeNode) => {
	if (!node.leaf) return;

	const found = selectedFiles.value.findIndex(v => v.fs_id === node.fs_id);
	if (found !== -1) {
		selectedFiles.value.splice(found, 1);
	}
};

const dialogStore = useCacheStore();
const start = () => {
	if (stringIsEmpty(downloadType.value.code)) {
		message.warn('请选择下载方式！');
		return;
	}
	// 清除缓存
	results.length = 0;
	blocked.value = true;
	starting.value = true;
	dialogStore.interceptUnload = true;
	const body: WorkerRequestBody[] = [];
	for (let file of selectedFiles.value) {
		body.push({fs_id: file.fs_id, reqId: requestId, surl, pwd, ...shareInfo.value});
	}
	worker.addTask(body);
};

const stop = () => {
	blocked.value = false;
	starting.value = false;
	dialogStore.interceptUnload = false;
	progress.value = 0;
};

const onWorkerMessage = async (m: WorkerResponse) => {
	if (m.type === 'done') {
		stop();
		message.success('全部任务已完成！');
		if (downloadType.value.code === 'web') {
			await packageDownloadLinks(results, userRef.exportFormat.value);
			stop();
			return;
		}
		stop();
		return;
	}
	if (m.type === 'progress') {
		const max = m.max || 1;
		const n = m.n || 0
		progress.value = Math.round(n / max * 100);
		return;
	}
	if (m.type === 'success') {
		if (downloadType.value.code === 'jsonrpc') {
			sendToRPC(m!!.body!!.dlink, m!!.body!!.filename);
			return;
		}
		// Web
		results.push({
			filename: m!!.body!!.filename,
			link: m!!.body!!.dlink
		});
	}
	if (m.type === 'error') {
		message.warn(m.message!!);
	}
};

const testConnectionRPC = () => {
	testJsonrpc(userStore.rpc.host, Number(userStore.rpc.port)).then(r => {
		if (r) {
			message.success('连接成功！');
		} else {
			message.warn('连接失败！');
		}
	});
};

onBeforeUnmount(() => {
	worker.setCallback(undefined);
});

worker.setCallback(onWorkerMessage);

</script>

<template>
	<div class="layout-toolbar">
		<div class="layout-toolbar-logo">
			开始下载 - <span>F4Pan</span>
		</div>
	</div>
	<div class="layout-main-container">
		<div class="layout-main">
			<div class="grid">
				<div class="col-12 lg:col-8 xl:col-8" id="driver-step-file-list">
					<Fieldset legend="文件列表">
						<BlockUI :blocked="blocked">
							<ProgressBar v-if="blocked || treeLoading" mode="indeterminate"
							             style="height: 6px"></ProgressBar>
							<Tree class="mt-4" loadingMode="icon" :value="filesRef" selection-mode="multiple"
							      @node-expand="onNodeExpand" :loading="treeLoading" @nodeSelect="onNodeSelect"
							      @nodeUnselect="onNodeUnSelect"
							      v-model:selectionKeys="selectedFilesOrigin"/>
						</BlockUI>
					</Fieldset>
				</div>
				<div class="col-12 lg:col-4 xl:col-4">
					<Fieldset legend="文件信息" id="driver-step-file-count">
						<ul class="list-none p-0 m-0">
							<li class="flex flex-row align-items-center justify-content-between">
								<div>
									<span class="text-900 font-medium mr-2 mb-1 md:mb-0">已选择的文件</span>
								</div>
								<div class="mt-2 md:mt-0 flex align-items-center">
									<span class="text-blue-500 ml-3 font-medium">{{ selectedFiles.length }}</span>
								</div>
							</li>
							<li class="flex flex-row align-items-center justify-content-between">
								<div>
									<span class="text-900 font-medium mr-2 mb-1 md:mb-0">总文件大小</span>
								</div>
								<div class="mt-2 md:mt-0 flex align-items-center">
									<span class="text-green-500 ml-3 font-medium">{{
											renderSize(selectedFiles.map(v => v.size).reduce((a, b) => a + b, 0))
										}}</span>
								</div>
							</li>
						</ul>
					</Fieldset>
					<Fieldset legend="下载配置" class="mt-4 mb-4 p-fluid" toggleable :disabled="blocked" id="driver-step-select-download-type">
						<div class="formgrid grid">
							<div class="field col">
								<label for="type">下载方式</label>
								<Dropdown v-model="downloadType" :disabled="blocked"
								          :options="[{name: 'Web', code: 'web'}, {name: 'JSON RPC', code: 'jsonrpc'}]"
								          optionLabel="name" placeholder="选择下载方式"/>
							</div>
						</div>
						<template v-if="downloadType.code === 'web'">
							<Divider align="left" type="solid">
								<b>Web</b>
							</Divider>
							<div class="formgrid grid">
								<div class="field col">
									<label for="format">导出格式</label>
									<InputText type="text" placeholder="{filename}-{url}" v-model="exportFormat"/>
								</div>
							</div>
						</template>
						<template v-if="downloadType.code === 'jsonrpc'">
							<Divider align="left" type="solid">
								<b>JSON RPC</b>
							</Divider>
							<div class="formgrid grid">
								<div class="field col">
									<label for="host">主机</label>
									<InputText type="text" placeholder="localhost" v-model="rpcRef.host"/>
								</div>
								<div class="field col">
									<label for="port">端口</label>
									<InputText type="number" placeholder="6800" v-model="rpcRef.port"/>
								</div>
							</div>
							<div class="formgrid grid">
								<div class="field col">
									<label for="token">密钥</label>
									<InputText type="text" v-model="rpcRef.token"/>
								</div>
								<div class="field col">
									<Button label="检测连通性" style="margin-top: 25px;" id="driver-step-test-json-rpc"
									        @click="testConnectionRPC"></Button>
								</div>
							</div>
						</template>
					</Fieldset>
					<Fieldset legend="准备下载">
						<ProgressBar :mode="starting && progress === 0 ? 'indeterminate' : 'determinate'" v-if="starting"
						             :value="progress"></ProgressBar>
						<Divider/>
						<ButtonGroup>
							<Button label="开始" icon="pi pi-check" :disabled="selectedFiles.length === 0" id="driver-step-done"
							        @click="start"/>
							<Button label="取消" icon="pi pi-times" :disabled="!starting" @click="stop"/>
						</ButtonGroup>
					</Fieldset>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>