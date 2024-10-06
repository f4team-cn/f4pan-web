<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Image from 'primevue/image';
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import BlockUI from 'primevue/blockui';
import ProgressBar from 'primevue/progressbar';
import Tree from 'primevue/tree';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import ButtonGroup from 'primevue/buttongroup';
import {nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';
import {useCacheStore, useSystemConfigStore, useUserStore} from '@/store';
import {useMessage} from '@/hooks/useMessage';
import {useRoute, useRouter} from 'vue-router';
import {useWorker} from '@/hooks/useWorker';
import {renderSize} from '@/utils/render-size';
import {sendToRPC} from '@/utils/send-to-rpc';
import {
	package2Aria2Input,
	package2IDMLinks,
	package2JsonFile,
	packageDownloadLinks
} from '@/utils/package-download-links';
import {getFileList} from '@/services/parse';
import {dealFileList} from '@/utils/deal-file-list';
import type {ParsedFile, ShareInfo, TreeFileInfo, WorkerRequestBody, WorkerResponse} from '@/types';
import type {TreeNode} from 'primevue/treenode';
import {testJsonrpc} from '@/utils/test-jsonrpc';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {actionTwo} from '@/utils/show-driver';
import delay from '@/utils/delay';
import {getJsonRpcConfig} from '@/utils/get-jsonrpc-config';
import Message from 'primevue/message';
import {addUri, waken} from '@/utils/motrix';
import allowAlwaysOpenImage from '@/assets/allow-always-open.png';
import copyToClipboard from 'copy-to-clipboard';

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
const selectedFilesOrigin = ref<Record<string | number, any>>({});
const selectedFiles = ref<(TreeFileInfo & TreeNode)[]>([]);
const starting = ref(false);
const shareInfo = ref<ShareInfo>({seckey: '', share_id: '', uk: ''});
const worker = useWorker();
const userStore = useUserStore();
const userRef = storeToRefs(userStore);
const rpcRef = userRef.rpc;
const exportFormat = userRef.exportFormat;
const systemStore = useSystemConfigStore();
const downloadType = ref<{
	code: 'web' | 'jsonrpc' | 'idm' | 'aria2input' | 'motrix' | 'jsonfile' | ''
}>({
	code: ''
});
const rndDir = ref('');
const progress = ref(0);
const succeedTick = ref(0);
const rpcInit = ref(false);
const motrixProtocolLoading = ref(false);
const results = reactive<ParsedFile[]>([]);
const resultViewCollapsedRef = ref(false);

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
		rndDir.value = files[0].filename;
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

const selectFile = (node: TreeNode & TreeFileInfo) => {
	if (!node.leaf && node.children === undefined) {
		nextTick(() => {
			delete selectedFilesOrigin.value[node.key];
		});
		return;
	}
	if (node.children && !node.leaf) {
		node.children.forEach((child => selectFile(child as typeof node)));
	} else {
		const found = selectedFiles.value.find(v => v.fs_id === node.fs_id);
		if (!found) {
			selectedFiles.value.push(node);
		}
	}
};

const unSelectFile = (node: TreeNode & TreeFileInfo) => {
	if (node.children) {
		node.children.forEach((child => unSelectFile(child as typeof node)));
	} else {
		const found = selectedFiles.value.findIndex(v => v.fs_id === node.fs_id);
		if (found !== -1) {
			selectedFiles.value.splice(found, 1);
		}
	}
};

const onNodeSelect = (node: TreeNode & TreeFileInfo) => {
	if (!node.leaf && node.children === undefined) {
		message.warn('请先加载该文件夹下的所有文件！');
		nextTick(() => {
			delete selectedFilesOrigin.value[node.key];
		});
		return;
	}
	selectFile(node);
};

const onNodeUnSelect = (node: TreeNode & TreeFileInfo) => {
	if (!node.leaf) {
		node?.children?.forEach(child => unSelectFile(child as typeof node));
		return;
	}
	unSelectFile(node);
};

const dialogStore = useCacheStore();
const start = () => {
	if (stringIsEmpty(downloadType.value.code)) {
		message.warn('请选择下载方式！');
		return;
	}
	// 清除缓存
	succeedTick.value = 0;
	results.length = 0;
	resultViewCollapsedRef.value = false;
	blocked.value = true;
	starting.value = true;
	dialogStore.interceptUnload = true;
	const body: WorkerRequestBody[] = [];
	const short = downloadType.value.code === 'motrix';
	const add = (file: TreeFileInfo & TreeNode) => {
		if (file.children) {
			file.children.forEach(child => {
				add(child as typeof file);
			});
		} else {
			body.push({fs_id: file.fs_id, reqId: requestId, surl, pwd, ...shareInfo.value, short});
		}
	};
	selectedFiles.value.forEach(file => {
		add(file);
	});
	worker.addTask(body);
};

const stop = () => {
	blocked.value = false;
	starting.value = false;
	dialogStore.interceptUnload = false;
	progress.value = 0;
	succeedTick.value = 0;
};

const onWorkerMessage = async (m: WorkerResponse) => {
	if (m.type === 'done') {
		if (succeedTick.value === 0) {
			message.warn('全部任务失败，请重新获取！');
			stop();
			return;
		}
		resultViewCollapsedRef.value = true;
		message.success('全部任务已完成！');
		if (downloadType.value.code === 'web') {
			await packageDownloadLinks(results, userRef.exportFormat.value);
		} else if (downloadType.value.code === 'idm') {
			await package2IDMLinks(results);
		} else if (downloadType.value.code === 'aria2input') {
			await package2Aria2Input(results);
		} else if (downloadType.value.code === 'jsonfile') {
			await package2JsonFile(results);
		}

		stop();
		return;
	}
	if (m.type === 'progress') {
		const max = m.max || 1;
		const n = m.n || 0;
		progress.value = Math.round(n / max * 100);
		return;
	}
	if (m.type === 'success') {
		succeedTick.value++;
		results.push({
			id: results.length + 1,
			filename: m!!.body!!.filename,
			link: m!!.body!!.dlink
		});
		if (downloadType.value.code === 'jsonrpc' || downloadType.value.code === 'motrix') {
			const file = selectedFiles.value.find(f => String(f.fs_id) === String(m!!.body!!.filefsid));
			if (file === undefined) {
				message.warn(`${m!!.body!!.filename} 下载失败，请刷新页面后重试！`);
				return;
			}
			const rootDir = file.path.replace(new RegExp(`/${rndDir.value.replace(/[\[\]]/g, '\\$&')}.*`, 'g'), '');
			const dir = file.path.replace(new RegExp(`^${rootDir}`), '').replace(m!!.body!!.filename, '');
			if (downloadType.value.code === 'jsonrpc') {
				sendToRPC(m!!.body!!.dlink, m!!.body!!.filename, dir);
			} else if (downloadType.value.code === 'motrix') {
				await addUri(m!!.body!!.dlink, m!!.body!!.filename, dir);
			}
			return;
		}
	}
	if (m.type === 'error') {
		message.warn(m.message!!);
	}
};

const testConnectionRPC = () => {
	rpcInit.value = true;
	testJsonrpc(userStore.rpc.host, Number(userStore.rpc.port)).then(r => {
		if (r) {
			message.success('测试 Aria2 连接成功！');
		} else {
			message.warn('测试 Aria2 连接失败！');
		}
	}).finally(() => rpcInit.value = false);
};

const getRPConfig = async () => {
	rpcInit.value = true;
	getJsonRpcConfig().then(rpcConfig => {
		if (rpcConfig.dir) {
			rpcRef.value.basedir = rpcConfig.dir;
			message.success('获取 Aria2 配置成功！');
		} else {
			message.warn('获取 Aria2 配置失败！');
		}
	}).finally(() => rpcInit.value = false);
};

const wakenMotrixClient = async () => {
	motrixProtocolLoading.value = true;
	await waken();
	message.default('已发起唤起 Motrix 客户端请求，如果没有唤起客户端，请确保安装了支持该协议的版本。');
	motrixProtocolLoading.value = false;
};

const copyResult = (file: ParsedFile) => {
	copyToClipboard(file.link);
	message.success('复制下载链接成功！');
};

const copyUserAgent = () => {
	copyToClipboard(systemStore.parse_ua);
	message.success('复制成功！');
}

onBeforeUnmount(() => {
	worker.setCallback(undefined);
});

worker.setCallback(onWorkerMessage);

watch(downloadType, value => {
	// json rpc 自动获取下载目录
	if (value.code === 'jsonrpc') {
		getRPConfig();
	}
});
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
							<Tree class="mt-4" loadingMode="icon" :value="filesRef" selection-mode="checkbox"
							      @node-expand="onNodeExpand" :loading="treeLoading" @nodeSelect="onNodeSelect"
							      @nodeUnselect="onNodeUnSelect"
							      v-model:selectionKeys="selectedFilesOrigin"/>
						</BlockUI>
					</Fieldset>
					<div class="mt-4">
						<Fieldset legend="解析结果" toggleable :collapsed="!resultViewCollapsedRef">
							<DataTable :value="results" dataKey="id">
								<template #empty>
									暂时任何解析数据！
								</template>
								<template #header>
									<Button @click="copyUserAgent">复制 User-Agent</Button>
								</template>
								<Column field="filename" header="文件名"></Column>
								<Column header="操作">
									<template #body="item">
										<Button icon="pi pi-copy" rounded class="mb-2 mr-2" @click="copyResult(item.data)" />
									</template>
								</Column>
							</DataTable>
						</Fieldset>
					</div>
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
					<Fieldset legend="下载配置" class="mt-4 mb-4 p-fluid" toggleable :disabled="blocked"
					          id="driver-step-select-download-type">
						<div class="formgrid grid">
							<div class="field col">
								<label for="type">下载方式</label>
								<Dropdown v-model="downloadType" :disabled="blocked"
								          :options="[{name: 'Web', code: 'web'},
								          {name: 'Aria2 JSON RPC (推荐)', code: 'jsonrpc'},
								          {name: 'Motrix (推荐)', code: 'motrix'},
								          {name: 'IDM 下载', code: 'idm'},
								          {name: 'Aria2 Input', code: 'aria2input'},
								          {name: 'JSON 文件', code: 'jsonfile'}]"
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
									        :loading="rpcInit"
									        @click="testConnectionRPC"></Button>
								</div>
							</div>
							<div class="formgrid grid">
								<div class="field col">
									<label for="basedir">下载目录(最好不要留空)</label>
									<InputText type="text" placeholder="" v-model="rpcRef.basedir"/>
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
						<template v-if="downloadType.code === 'idm'">
							<Divider align="left" type="solid">
								<b>IDM 下载导入说明</b>
							</Divider>
							<p>压缩包内会生成一个 ef2 格式的文件，仅可在<strong>电脑版IDM</strong>中使用。<br>
								打开IDM，点击右上角<strong>任务</strong>——<strong>导入</strong>——<strong>从"IDM导出文件"导入</strong><br>
								此功能会自动帮你设置UA，无需在IDM设置中更改。<br>
							</p>
						</template>
						<template v-if="downloadType.code === 'aria2input'">
							<Divider align="left" type="solid">
								<b>Aria2 Input方式</b>
							</Divider>
							<p><strong>非专业人士请使用Aria2 JSON RPC模式</strong><br>
								使用 aria2 命令行输入文件开始下载. (aria2c -i task.txt)<br>
							</p>
						</template>
						<template v-if="downloadType.code === 'motrix'">
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
									<Image :src="allowAlwaysOpenImage" height="150" width="320" preview/>
								</template>
							</Card>
							<div class="formgrid grid">
								<div class="field col">
									<Button label="测试唤起" style="margin-top: 25px;" id="driver-step-test-json-rpc"
									        :loading="motrixProtocolLoading"
									        @click="wakenMotrixClient"></Button>
								</div>
							</div>
							<Message :closable="false" severity="warn">值得注意的是，使用本下载方式，依然需要更改下载目录，即本下载方式和<strong>Aria2 JSON RPC</strong>的下载目录数据通用，你可以先选择<strong>Aria2 JSON RPC</strong>下载方式，获取默认配置后再切换回本下载方式，即可获取Motrix中已经配置的下载目录，你也可以在下方输入框中手动输入下载目录。</Message>
							<div class="formgrid grid">
								<div class="field col">
									<label for="basedir">下载目录(最好不要留空)</label>
									<InputText type="text" placeholder="" v-model="rpcRef.basedir"/>
								</div>
							</div>
						</template>
						<template v-if="downloadType.code === 'jsonfile'">
							<Divider align="left" type="solid">
								<b>导出为 JSON 文件</b>
							</Divider>
							<Message :closable="false" severity="info">
								本下载方式生成了一个 JSON 文件，开发者可基于本数据二次开发。
							</Message>
						</template>
					</Fieldset>
					<Fieldset legend="准备下载">
						<ProgressBar :mode="starting && progress === 0 ? 'indeterminate' : 'determinate'"
						             v-if="starting"
						             :value="progress"></ProgressBar>
						<Divider/>
						<ButtonGroup>
							<Button label="开始" icon="pi pi-check" :disabled="selectedFiles.length === 0"
							        id="driver-step-done"
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
