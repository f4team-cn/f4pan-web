<script setup lang="ts">
import Panel from 'primevue/panel';
import {getSystemStatus} from '@/services/system';
import {onMounted, ref} from 'vue';
import {useMessage} from '@/hooks/useMessage';
import {getStatisticIPCount} from '@/services/statistic';

const message = useMessage();
const parsedAllCount = ref('……');
const spentVip = ref(0);
const parsedTick = ref(0);
const ipNum = ref(0);
const requestNum = ref(0);
const parsedTodayCount = ref('……');

onMounted(() => {
	// 延迟一会等待 toast 自动配置 z-index 后
	setTimeout(async () => {
		message.default('正在加载……');
		try {
			const {data} = (await getSystemStatus()).data;
			parsedAllCount.value = data.total_parsing_traffic_format;
			parsedTodayCount.value = data.today_parsing_traffic_format;
			spentVip.value = data.spent_svip_count;
			parsedTick.value = data.total_parsing_count;
			const {data: ip} = (await getStatisticIPCount()).data;
			ipNum.value = ip.ip_type;
			requestNum.value = ip.all_count;
			message.clear();
		} catch {}
	}, 888);
});
</script>

<template>
	<div class="col-12">
		<div class="grid">
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">今日解析量</span>
							<div class="text-900 font-medium text-xl">{{ parsedTodayCount }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-pink-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-calendar-minus text-pink-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">总解析量</span>
							<div class="text-900 font-medium text-xl">{{ parsedAllCount }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-blue-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-cloud-download text-blue-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">解析次数</span>
							<div class="text-900 font-medium text-xl">{{ parsedTick }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-purple-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-clock text-purple-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">已使用的系统账号</span>
							<div class="text-900 font-medium text-xl">{{ spentVip }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-green-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-user text-green-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">IP数</span>
							<div class="text-900 font-medium text-xl">{{ ipNum }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-red-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-android text-red-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
			<div class="col-12 lg:col-6 xl:col-3">
				<Panel>
					<div class="flex justify-content-between mb-3">
						<div>
							<span class="block text-500 font-medium mb-3">总请求数</span>
							<div class="text-900 font-medium text-xl">{{ requestNum }}</div>
						</div>
						<div class="flex align-items-center justify-content-center bg-orange-100 border-round"
						     style="width: 2.5rem; height: 2.5rem">
							<i class="pi pi-book text-orange-500 text-xl"></i>
						</div>
					</div>
				</Panel>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
