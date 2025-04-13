<script setup lang="ts">
import Panel from 'primevue/panel';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';
import { useCacheStore, useSystemConfigStore, useUserStore } from '@/store';
import { useMessage } from '@/hooks/useMessage';
import type { MenuItem } from 'primevue/menuitem';
import { parseBaiduShareUrl } from '@/utils/parse-baidu-share-url';
import { getRequestId } from '@/services/parse';
import { useRouter } from 'vue-router';
import { actionOne } from '@/utils/show-driver';
import HistoryTotal from '@/components/HistoryTotal.vue';

const router = useRouter();
const cacheStore = useCacheStore();
const pwd = ref('');
const url = ref('');
const surl = ref('');
const loading = ref(false);
const historyTotalChartCollapsed = ref(false);
const userStore = useUserStore();
const message = useMessage();
const systemConfigStore = useSystemConfigStore();
const menu = ref<Menu>();
const items = ref<MenuItem[]>([
	{
		label: '更多操作',
		items: [
			{
				label: '公告',
				icon: 'pi pi-bell',
				command: () => {
					cacheStore.noticeDialog = !cacheStore.noticeDialog;
				}
			},
			{
				label: '登录后台',
				icon: 'pi pi-cloud',
				command: () => {
					cacheStore.adminLogin = !cacheStore.adminLogin;
				}
			},
			{
				label: '新手教程',
				icon: 'pi pi-graduation-cap',
				command: () => {
					window.localStorage.removeItem('driver-step-done');
					actionOne();
				}
			}
		]
	}
]);

const toggle = (event: Event) => {
	menu?.value?.toggle(event);
};

const doParser = async () => {
	let password;
	if (systemConfigStore.requires_key !== 'none') {
		cacheStore.parseVerify = true;
		password = await cacheStore.awaitForParseVerify();
		if (password.length === 0) {
			return;
		}
	}
	loading.value = true;
	message.default('正在加载……');
	getRequestId(surl.value, pwd.value, password).then(({ data: res }) => {
		userStore.req_id = res.data;
		router.push({
			name: 'Parsed',
			params: {
				reqId: res.data,
				surl: surl.value,
				pwd: pwd.value
			}
		});
	});
};


watch(url, value => {
	const result = parseBaiduShareUrl(value);
	if (result.pwd) {
		pwd.value = result.pwd;
		message.success('识别到密码，已自动填充！');
	}
	if (result.surl) {
		surl.value = result.surl;
	}
});

</script>

<template>
	<div class="main-container">
		<div class="main">
			<Panel>
				<template #header>
					<div class="title">
						<span class="font-bold">F4Pan</span>
					</div>
				</template>
				<template #icons>
					<Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
					<button class="p-panel-header-icon p-link mr-2" @click="toggle" :disabled="loading"
					        id="driver-step-menu">
						<span class="pi pi-cog"></span>
					</button>
				</template>
				<div class="p-fluid">
					<div class="field" id="driver-step-pan-url-input">
						<label for="disk-url">网盘链接</label>
						<InputText type="text" v-model="url" />
					</div>
					<div class="field" id="driver-step-pan-pwd-input">
						<label for="disk-password">网盘密码</label>
						<InputText type="text" v-model="pwd" />
					</div>
					<Button @click="doParser" label="提交" id="driver-step-action-parse" />
				</div>
			</Panel>
			<Panel class="mt-4" toggleable :collapsed="!historyTotalChartCollapsed">
				<template #header>
					<div class="flex align-items-center gap-2">
						<span class="font-bold">历史统计</span>
					</div>
				</template>
				<HistoryTotal :days="4" />
			</Panel>
		</div>
	</div>
</template>

<style scoped>

</style>
