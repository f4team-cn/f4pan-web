<script setup lang="ts">
import {onMounted, ref} from 'vue';
import Card from 'primevue/card';
import DataTable, {type DataTableFilterMeta} from 'primevue/datatable';
import Column from 'primevue/column';
import Chip from 'primevue/chip';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import type {VipAccount} from '@/types';
import {useMessage} from '@/hooks/useMessage';
import {deleteVipAccount, getVipAccountList, updateVipAccount} from '@/services/svip';
import Button from 'primevue/button';
import VipAccountEditDialog from '@/components/dialog/VipAccountEditDialog.vue';
import {useConfirm} from 'primevue/useconfirm';
import {FilterMatchMode} from 'primevue/api';

const filters = ref<DataTableFilterMeta>({
	can_use: {
		value: null,
		matchMode: FilterMatchMode.EQUALS
	}
});
const loading = ref(false);
const refreshing = ref(false);
const rows = ref([]);
const dialog = ref<InstanceType<typeof VipAccountEditDialog>>();
const items = ref<VipAccount[]>([]);
const message = useMessage();
const editorType = ref<'new' | 'edit'>('new');
const cookie = ref('');
const updateId = ref(-1);
const confirm = useConfirm();

const refresh = async () => {
	try {
		refreshing.value = true;
		const response = await getVipAccountList();
		if (response.data.data.length > 0) {
			// 清空列表
			items.value.length = 0;
			items.value.push(...response.data.data);
		}
	} catch {
		message.warn('加载会员账号失败！请稍后刷新页面！');
	} finally {
		refreshing.value = false;
	}
};

const newAccount = () => {
	editorType.value = 'new';
	dialog.value?.showDialog();
};

const onDeleteVipAccount = (event: Event, account: VipAccount) => {
	confirm.require({
		target: event.target as HTMLElement,
		message: '您要删除此账号吗？',
		icon: 'pi pi-info-circle',
		rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
		acceptClass: 'p-button-danger p-button-sm',
		rejectLabel: '取消',
		acceptLabel: '确定',
		accept: async () => {
			try {
				message.default('正在删除……');
				(await deleteVipAccount(account.id));
				message.success('删除成功');
				const index = items.value.findIndex(v => v.id === account.id);
				items.value.splice(index, 1);
			} catch {
				message.warn('删除失败！');
			}
		},
		reject: () => {
		}
	});
};

const onChangeAccount =  async (account: VipAccount) => {
	try {
		loading.value = true;
		await updateVipAccount(account.id);
		message.success('更新成功！');
		await refresh();
	} catch {
		message.error('更新失败！')
	} finally {
		loading.value = false;
	}
};

onMounted(refresh);
</script>

<template>
	<div class="col-12">
		<VipAccountEditDialog ref="dialog" :id="updateId" :type="editorType" :cookie="cookie"
		                      @operation:done="refresh"/>
		<Card>
			<template #content>
				<DataTable :value="items" dataKey="id" filter-display="menu" v-model:filters="filters"
				           tableStyle="min-width: 60rem" v-model:expanded-rows="rows" :loading="refreshing">
					<template #loading>
						正在加载，请稍后……
					</template>
					<template #empty>
						暂时没有数据，添加一个吧！
					</template>
					<template #header>
						<div class="md:flex md:flex-row md:flex-nowrap">
							<Button icon="pi pi-plus" label="添加" class="mr-2 mb-2 flex-grow-0" @click="newAccount"/>
						</div>
					</template>
					<Column expander header-style="width: 3rem;"/>
					<Column field="id" header="ID" :sortable="true"/>
					<Column field="name" header="用户名"/>
					<Column field="can_use" header="是否可用" data-type="boolean">
						<template #body="{ data }">
							<i class="pi"
							   :class="{ 'pi-check-circle text-green-500': data.can_use, 'pi-times-circle text-red-400': !data.can_use }"></i>
						</template>
						<template #filter="{ filterModel, filterCallback }">
							<TriStateCheckbox v-model="filterModel.value" @change="filterCallback()"/>
						</template>
					</Column>
					<Column header="状态">
						<template #body="{ data }">
							<p>
								<Tag severity="success" v-if="data.show_msg === '可用'">可用</Tag>
								<Tag severity="danger" v-else-if="data.show_msg === '过期'">可用</Tag>
								<Tag v-else>限速</Tag>
							</p>
						</template>
					</Column>
					<Column header="添加时间">
						<template #body="{ data }">
							<p>{{ new Date(data.add_time * 1000).toLocaleString() }}</p>
						</template>
					</Column>
					<Column header="会员到期时间">
						<template #body="{ data }">
							<p>{{ new Date(data.svip_end_time * 1000).toLocaleString() }}</p>
						</template>
					</Column>
					<Column header="账号类型">
						<template #body="{ data }">
							<p>
								<Chip :label="data.vip_type"></Chip>
							</p>
						</template>
					</Column>
					<Column header="操作" headerStyle="width:4rem">
						<template #body="item">
							<Button icon="pi pi-pen" severity="info" rounded class="mb-2 mr-2" :loading="loading"
							        @click="onChangeAccount(item.data)"/>
							<Button icon="pi pi-trash" severity="danger" rounded class="mb-2 mr-2" :loading="loading"
							        @click="onDeleteVipAccount($event, item.data)"/>
						</template>
					</Column>
					<template #expansion="item">
						<h4>Cookie:</h4>
						<Divider layout="vertical"/>
						<p class="m-0">{{ item.data.cookie }}</p>
					</template>
				</DataTable>
			</template>
		</Card>
	</div>
</template>

<style scoped>

</style>