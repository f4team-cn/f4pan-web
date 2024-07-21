<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {deleteNotice, getAllNotice, useNotice} from '@/services/notice';
import type {Notice} from '@/types';
import {useMessage} from '@/hooks/useMessage';
import NoticeEditDialog from '@/components/dialog/NoticeEditDialog.vue';
import {useConfirm} from 'primevue/useconfirm';
import InputGroup from 'primevue/inputgroup';
import Dropdown from 'primevue/dropdown';
import InputGroupAddon from 'primevue/inputgroupaddon';

const refreshing = ref(false);
const items = ref<Notice[]>([]);
const message = useMessage();
const showEditDialog = ref(false);
const editDialogTitleRef = ref('');
const editDialogContentRef = ref('');
const editDialogIdRef = ref<number | undefined>(undefined);
const confirm = useConfirm();
const editDialogTypeRef = ref<'edit' | 'new'>('edit');
const activeNoticeRef = ref<Notice | undefined>(undefined);
const activeNoticeLoading = ref(false);

const lookNotice = (notice: Notice) => {
	editDialogTitleRef.value = notice.title;
	editDialogContentRef.value = notice.content;
	editDialogIdRef.value = notice.id;

	showEditDialog.value = true;
};

const onDeleteNotice = (event: Event, notice: Notice) => {
	confirm.require({
		target: event.target as HTMLElement,
		message: '您要删除此公告吗？',
		icon: 'pi pi-info-circle',
		rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
		acceptClass: 'p-button-danger p-button-sm',
		rejectLabel: '取消',
		acceptLabel: '确定',
		accept: async () => {
			try {
				message.default('正在删除……');
				(await deleteNotice(notice.id));
				message.success('删除成功');
				// 删除列表中的元素
				const index = items.value.findIndex(v => v.id === notice.id);
				items.value.splice(index, 1);
			} catch {
				message.warn('删除失败！');
			}
		},
		reject: () => {}
	});
};

const refresh = async () => {
	try {
		refreshing.value = true;
		const response = await getAllNotice();
		if (response.data.data.length > 0) {
			// 清空列表
			items.value.length = 0;
			items.value.push(...response.data.data);
		}
	} catch {
		message.warn('加载公告失败！请稍后刷新页面！');
	} finally {
		refreshing.value = false;
	}
};

const onAddNotice = () => {
	editDialogTitleRef.value = '';
	editDialogContentRef.value = '';
	editDialogIdRef.value = undefined;
	editDialogTypeRef.value = 'new';

	showEditDialog.value = true;
};

const onActiveNotice = async () => {
	if (activeNoticeRef.value == undefined) {
		message.warn('请选择公告！');
		return;
	}
	activeNoticeLoading.value = true;
	try {
		(await useNotice(activeNoticeRef.value.id));
		message.success('设置成功！');
	} catch {
		activeNoticeRef.value = undefined;
		message.warn('设置失败！');
	}
	activeNoticeLoading.value = false;
};

onMounted(refresh);
</script>

<template>
	<div class="col-12">
		<NoticeEditDialog @operation:done="refresh" :title="editDialogTitleRef" :content="editDialogContentRef" v-model="showEditDialog" :type="editDialogTypeRef" :id="editDialogIdRef" />
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
							<Button icon="pi pi-plus" label="添加公告" class="mr-2 mb-2 flex-grow-0" @click="onAddNotice" />
							<InputGroup class="flex-grow-0">
								<InputGroupAddon>激活的公告</InputGroupAddon>
								<Dropdown :options="items" optionLabel="title" placeholder="选择公告" v-model="activeNoticeRef">
									<template #option="slotProps">
										<span>{{ slotProps.option.id }} - {{ slotProps.option.title }}</span>
									</template>
								</Dropdown>
								<Button label="确定" @click="onActiveNotice" :loading="activeNoticeLoading" />
							</InputGroup>
						</div>
					</template>
					<Column field="id" header="ID" :sortable="true"/>
					<Column field="title" header="标题"/>
					<Column header="内容">
						<template #body="slotProps">
							<p>{{ slotProps.data.content.substring(0, 100) }}</p>
						</template>
					</Column>
					<Column header="操作" headerStyle="width:4rem">
						<template #body="slotProps">
							<Button icon="pi pi-eye" rounded class="mb-2 mr-2" @click="lookNotice(slotProps.data)"/>
							<Button icon="pi pi-trash" severity="danger" rounded class="mb-2 mr-2" @click="onDeleteNotice($event, slotProps.data)"/>
						</template>
					</Column>
				</DataTable>
			</template>
		</Card>
	</div>
</template>

<style scoped>

</style>