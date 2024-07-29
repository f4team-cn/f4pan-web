<script setup lang="ts">
import {onMounted, ref} from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import copy from 'copy-to-clipboard';
import type {ApiKey} from '@/types';
import {useMessage} from '@/hooks/useMessage';
import {useConfirm} from 'primevue/useconfirm';
import {deleteApiKey, generateApiKey, getApiKeyList} from '@/services/key';

const refreshing = ref(false);
const items = ref<ApiKey[]>([]);
const message = useMessage();
const confirm = useConfirm();
const loading = ref(false);

const onDeleteApiKey = (event: Event, api: ApiKey) => {
	confirm.require({
		target: event.target as HTMLElement,
		message: '您要删除此密钥吗？',
		icon: 'pi pi-info-circle',
		rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
		acceptClass: 'p-button-danger p-button-sm',
		rejectLabel: '取消',
		acceptLabel: '确定',
		accept: async () => {
			try {
				message.default('正在删除……');
				(await deleteApiKey(api.id));
				message.success('删除成功');
				const index = items.value.findIndex(v => v.id === api.id);
				items.value.splice(index, 1);
			} catch {
				message.warn('删除失败！');
			}
		}
	});
};

const refresh = async () => {
	loading.value = true;
	try {
		refreshing.value = true;
		const response = await getApiKeyList();
		if (response.data.data.length > 0) {
			// 清空列表
			items.value.length = 0;
			items.value.push(...response.data.data);
		}
	} catch {
		message.warn('加载密钥失败！请稍后刷新页面！');
	} finally {
		refreshing.value = false;
		loading.value = false;
	}
};

const onCopyKey = (key: ApiKey) => {
	copy(key.key || '');
	message.success('复制成功！');
};

const newApiKey = async () => {
	loading.value = true;
	try {
		const {data} = (await generateApiKey()).data;
		message.success('生成成功！已自动复制。');
		copy(data.key);
		await refresh();
	} catch {
		message.warn('生成失败！');
	} finally {
		loading.value = false;
	}
};

onMounted(refresh);
</script>

<template>
	<div class="col-12">
		<Card>
			<template #content>
				<DataTable :value="items" dataKey="id"
				           tableStyle="min-width: 60rem" :loading="refreshing">
					<template #loading>
						正在加载，请稍后……
					</template>
					<template #empty>
						暂时没有数据，添加一个吧！
					</template>
					<template #header>
						<div class="md:flex md:flex-row md:flex-nowrap">
							<Button :loading="loading" icon="pi pi-plus" label="添加" class="mr-2 mb-2 flex-grow-0" @click="newApiKey"/>
						</div>
					</template>
					<Column field="id" header="ID" :sortable="true"/>
					<Column field="key" header="KEY"/>
					<Column field="use_count" header="使用次数"/>
					<Column header="操作">
						<template #body="{data}">
							<Button icon="pi pi-copy" rounded class="mb-2 mr-2" @click="onCopyKey(data)"/>
							<Button icon="pi pi-trash" severity="danger" rounded class="mb-2 mr-2"
							        @click="onDeleteApiKey($event, data)"/>
						</template>
					</Column>
				</DataTable>
			</template>
		</Card>
	</div>
</template>

<style scoped>

</style>