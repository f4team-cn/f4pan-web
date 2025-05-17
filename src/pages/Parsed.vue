<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Fieldset from 'primevue/fieldset';
import BlockUI from 'primevue/blockui';
import ProgressBar from 'primevue/progressbar';
import Tree from 'primevue/tree';
import Toolbar from 'primevue/toolbar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import ButtonGroup from 'primevue/buttongroup';
import ScrollPanel from 'primevue/scrollpanel';
import Skeleton from 'primevue/skeleton';

import {
	computed,
	defineAsyncComponent,
	nextTick,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref
} from 'vue';
import { useCacheStore, useSystemConfigStore } from '@/store';
import { useMessage } from '@/hooks/useMessage';
import { useRoute, useRouter } from 'vue-router';
import { useWorker } from '@/hooks/useWorker';
import { renderSize } from '@/utils/render-size';
import { getFileList } from '@/services/parse';
import { dealFileList } from '@/utils/deal-file-list';
import type { ParsedFile, ShareInfo, TreeFileInfo, WorkerRequestBody, WorkerResponse } from '@/types';
import type { TreeNode } from 'primevue/treenode';
import { stringIsEmpty } from '@/utils/string-is-empty';
import { actionTwo } from '@/utils/show-driver';
import delay from '@/utils/delay';
import copyToClipboard from 'copy-to-clipboard';
import { type DownloadTypeCode, downloadTypes } from '@/utils/download-types';
import Loading from '@/pages/download/Loading.vue';
import { useLogger } from '@/hooks/useLogger';

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
const shareInfo = ref<ShareInfo>({ seckey: '', share_id: '', uk: '' });
const worker = useWorker();
const systemStore = useSystemConfigStore();
const downloadType = ref<{
	code: DownloadTypeCode | ''
}>({
	code: ''
});
const expandingAll = ref(false);
const expandedKeys = ref<Record<string | number, boolean>>({});
const rndDir = ref('');
const progress = ref(0);
const succeedTick = ref(0);
const results = reactive<ParsedFile[]>([]);
const resultViewCollapsedRef = ref(false);
const loggerCollapsedRef = ref(false);
const { logs, log } = useLogger();
const downloadComponent = computed<any>(() => {
	if (downloadType.value.code === '') return null;
	let type = downloadTypes.filter(v => v.code == downloadType.value.code)[0];
	if (!type) return null;
	log('切换下载方式:' + downloadType.value.code);
	// noinspection TypeScriptCheckImport
	return defineAsyncComponent({
		loader: () => import(`./download/${type.page}.vue`),
		loadingComponent: Loading
	});
});
const downloadComponentRef = ref<{
	onStart: () => any,
	onSuccess: (response: WorkerResponse, rootDir: string | undefined, fileDir: string | undefined) => any,
	onDone: (results: ParsedFile[]) => any,
	isValid: () => boolean,
} | null>(null);

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
		log('开始获取文件列表……');
		const { data: response } = await getFileList(requestId, undefined);
		const { data } = response;
		const files = data.list;
		rndDir.value = files[0].filename;
		log('文件列表获取成功，正在解析处理……');
		const { root, tree } = dealFileList(files);
		shareInfo.value = data.shareinfo;
		diskRoot.value = root;
		filesRef.value = tree;
		blocked.value = false;
		if (window.localStorage.getItem('driver-step-done') !== 'true') {
			actionTwo(onNextStep);
		}
	} catch (e) {
		console.error(e);
		log('获取并解析文件列表失败，请返回或刷新重试！');
		message.error('数据出错！请重新解析！');
		router.back();
	}
});

const onNodeExpand = async (node: TreeNode) => {
	if (node.children) return;
	node.loading = true;
	try {
		log(`打开文件夹 【${node.label}】 ……`);
		const { data: response } = await getFileList(requestId, node.path);
		if (response.data.list.length === 0) {
			log(`文件夹 【${node.label}】 为空`);

		}
		const { data } = response;
		const files = data.list;
		const { tree } = dealFileList(files);
		node.children = tree;
		console.log(node)
		console.log(expandedKeys.value)
		log(`打开文件夹 【${node.label}】 成功`);
	} catch {
		log(`打开文件夹 【${node.label}】 出错`, 'warning');
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
			log(`选择文件 【${node.label}】`);
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
			log(`取消选择文件 【${node.label}】`);
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
	if (downloadComponentRef.value?.isValid?.() === false) {
		log('没有通过对应下载方式的安全检查', 'warning');
		return;
	}
	log('开始解析任务……');
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
			body.push({ fs_id: file.fs_id, reqId: requestId, surl, pwd, ...shareInfo.value, short });
		}
	};
	downloadComponentRef.value?.onStart?.();
	selectedFiles.value.forEach(file => {
		add(file);
	});
	log('启动后台任务……');
	worker.addTask(body);
};

const stop = () => {
	downloadComponentRef.value?.onDone?.([]);
	blocked.value = false;
	starting.value = false;
	dialogStore.interceptUnload = false;
	progress.value = 0;
	succeedTick.value = 0;
	log('停止解析任务……');
};

const onWorkerMessage = async (m: WorkerResponse) => {
	if (m.type === 'done') {
		if (succeedTick.value === 0) {
			log('后台任务完成', 'success');
			message.warn('全部任务失败，请重新获取！');
			log('全部任务失败', 'warning');
			stop();
			return;
		}
		if (results.length != 0) {
			downloadComponentRef.value?.onDone?.(results);
		}
		resultViewCollapsedRef.value = true;
		log('后台任务完成', 'success');
		message.success('全部任务已完成！');

		stop();
		return;
	}
	if (m.type === 'progress') {
		const max = m.max || 1;
		const n = m.n || 0;
		progress.value = Math.round(n / max * 100);
		log(`更新进度 ${progress.value}%`);
		return;
	}
	if (m.type === 'success') {
		succeedTick.value++;
		results.push({
			id: results.length + 1,
			filename: m!!.body!!.filename,
			link: m!!.body!!.dlink
		});
		const file = selectedFiles.value.find(f => String(f.fs_id) === String(m!!.body!!.filefsid));
		const rootDir = file?.path?.replace(new RegExp(`/${rndDir.value.replace(/[\[\]]/g, '\\$&')}.*`, 'g'), '');
		const dir = file?.path?.replace(new RegExp(`^${rootDir}`), '')?.replace(m!!.body!!.filename, '');
		log(`文件 ${file?.label} 解析完成，正在通知 ${downloadType.value.code} 下载……`);
		downloadComponentRef.value?.onSuccess?.(m, rootDir, dir);
	}
	if (m.type === 'error') {
		log('后台任务出错，' + m.message);
		message.warn(m.message!!);
	}
};

const copyResult = (file: ParsedFile) => {
	copyToClipboard(file.link);
	message.success('复制下载链接成功！');
};

const copyUserAgent = () => {
	copyToClipboard(systemStore.parse_ua);
	message.success('复制成功！');
};

const expandAllNodes = async () => {
	if (!filesRef.value || filesRef.value.length === 0) return;
	log('展开全部文件夹...');
	if (!filesRef.value || filesRef.value.length === 0) {
		log('文件列表为空，无法全部展开并加载', 'info');
		return;
	}
	if (expandingAll.value) {
		log('正在进行全部展开和加载任务，请勿重复点击', 'warning');
		return;
	}

	log('开始全部展开并加载所有文件夹...');
	expandingAll.value = true;
	blocked.value = true;

	const loadAndExpandNode = async (node: (TreeFileInfo & TreeNode)) => {
		if (node.isdir !== 1 && node.leaf) return;
		if (!node.path) return;
		if (node.key !== undefined) {
			expandedKeys.value[node.key] = true;
			await nextTick();
			await delay(10);
		}

		if (node.children === undefined) {
			log(`加载文件夹 【${node.label}】 的内容...`);
			node.loading = true;
			try {
				const { data: response } = await getFileList(requestId, node.path);
				const files = response.data.list;

				if (!files || files.length === 0) {
					node.children = [];
				} else {
					const { tree: childrenTree } = dealFileList(files);
					node.children = childrenTree;
				}
				log(`文件夹 【${node.label}】 加载成功`);

			} catch (e) {
				console.error(e);
				log(`加载文件夹 【${node.label}】 出错`, 'warning');
				message.error(`加载文件夹 ${node.label} 出错！`);
				node.children = [];
			} finally {
				node.loading = false;
				await nextTick();
				await delay(10);
			}
		}
		if (node.children && Array.isArray(node.children)) {
			for (const childNode of node.children as (TreeFileInfo & TreeNode)[]) {
				if (childNode.isdir === 1 || !childNode.leaf) {
					await loadAndExpandNode(childNode);
				}
			}
		}
	};

	try {
		for (const rootNode of filesRef.value as (TreeFileInfo & TreeNode)[]) {
			await loadAndExpandNode(rootNode);
		}
		log('全部文件夹展开和加载任务完成', 'success');

	} catch (e) {
		console.error(e);
		log('全部展开和加载过程中发生错误', 'error');
		message.error('全部展开和加载过程中发生错误！');
	} finally {
		expandingAll.value = false;
		blocked.value = false;
	}
};

const collapseAllNodes = () => {
	log('收起全部文件夹...');
	expandedKeys.value = {};
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
				<div class="col-12 lg:col-8 xl:col-8">
					<Fieldset legend="文件列表" id="driver-step-file-list">
						<BlockUI :blocked="blocked">
							<Toolbar>
								<template #start>
									<Button icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"
											v-tooltip="'全部展开'" class="mr-2" severity="secondary" @click="expandAllNodes" />
									<Button icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"
											v-tooltip="'全部收起'" class="mr-2" severity="secondary" @click="collapseAllNodes" />
								</template>
							</Toolbar>
							<ProgressBar v-if="blocked || treeLoading" mode="indeterminate"
										 style="height: 6px"></ProgressBar>
							<!--							<Divider class="my-5" />-->
							<Tree loadingMode="icon" :value="filesRef" selection-mode="checkbox"
								  @node-expand="onNodeExpand" :loading="treeLoading" @nodeSelect="onNodeSelect"
								  @nodeUnselect="onNodeUnSelect"
								  v-model:selectionKeys="selectedFilesOrigin" v-model:expandedKeys="expandedKeys" />
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
										<Button v-tooltip="'复制链接'" icon="pi pi-copy" rounded class="mb-2 mr-2"
												@click="copyResult(item.data)" />
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
					<Fieldset legend="下载配置" class="mt-3 p-fluid" toggleable :disabled="blocked"
							  id="driver-step-select-download-type">
						<div class="formgrid grid">
							<div class="field col">
								<label for="type">下载方式</label>
								<Dropdown v-model="downloadType" :disabled="blocked"
										  :options="downloadTypes"
										  optionLabel="name" placeholder="选择下载方式" />
							</div>
						</div>
						<template v-if="downloadType.code.length !== 0">
							<component :is="downloadComponent" ref="downloadComponentRef" />
						</template>
					</Fieldset>
					<Fieldset legend="解析日志" toggleable class="mt-3 mb-3" :collapsed="!loggerCollapsedRef">
						<ScrollPanel class="logger-container" v-if="logs.length !== 0"
									 :pt="{
								wrapper: {
									style: {
										'border-right': '10px solid var(--surface-ground)'
									}
								},
								bary: 'hover:bg-primary-400 bg-primary-300 opacity-100'
							}">
							<p v-for="log in logs" :data-type="log.type" v-text="log.data"></p>
						</ScrollPanel>
						<Skeleton v-else width="100%" height="180px"></Skeleton>
					</Fieldset>
					<Fieldset legend="准备下载">
						<ProgressBar :mode="starting && progress === 0 ? 'indeterminate' : 'determinate'"
									 v-if="starting"
									 :value="progress"></ProgressBar>
						<Divider />
						<ButtonGroup>
							<Button label="开始" icon="pi pi-check" :disabled="selectedFiles.length === 0 || starting"
									id="driver-step-done"
									@click="start" />
							<Button label="取消" icon="pi pi-times" :disabled="!starting" @click="stop" />
						</ButtonGroup>
					</Fieldset>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.logger {
	&-container {
		width: 100%;
		height: 180px;

		p {
			margin-top: 0;
			margin-bottom: 0;

			&[data-type="success"] {
				color: #16a34a;
			}

			&[data-type="warning"] {
				color: #ca8a04;
			}

			&[data-type="info"] {
				color: #2563eb;
			}

			&[data-type="error"] {
				color: #dc2626;
			}
		}
	}
}
</style>
