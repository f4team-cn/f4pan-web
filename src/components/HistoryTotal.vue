<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';
import { getDailyStatus } from '@/services/system';
import { useMessage } from '@/hooks/useMessage';

interface Props {
	days: number;
};

const chartData = ref();
const chartOptions = ref();
const loading = ref<boolean>(true);
const message = useMessage();
const props = defineProps<Props>();

const formatDate = (date: Date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

onMounted(async () => {
	try {
		const response = await getDailyStatus(props.days);
		const date = new Date();
		const formatDated = formatDate(date);
		const yesterdayDate = new Date();
		yesterdayDate.setDate(yesterdayDate.getDate() - 1);
		const formatYesterdayDate = formatDate(yesterdayDate);

		const labels: any[] = [];
		const parsingTraffic: number[] = [];
		const parsingCount: number[] = [];
		console.log(formatDated);
		// 处理数据
		response.data.data?.forEach(daily => {
			labels.push(daily.stat_date === formatDated ? '今天' : (daily.stat_date === formatYesterdayDate ? '昨天' : daily.stat_date));
			parsingTraffic.push(Math.floor(daily.parsing_traffic / 1024 / 1024 / 1024));
			parsingCount.push(daily.parsing_count);
		});

		chartData.value = setChartData(labels, parsingTraffic, parsingCount);
		chartOptions.value = setChartOptions();
		loading.value = false;
	} catch {
		message.warn('历史统计加载失败');
	}
});

const setChartData = (labels: any[], data1: any[], data2: any[]) => {
	// noinspection JSCheckFunctionSignatures
	const documentStyle = getComputedStyle(document.documentElement);

	return {
		labels,
		datasets: [
			{
				label: '解析容量(GB)',
				data: data1,
				fill: false,
				tension: 0.4,
				borderColor: documentStyle.getPropertyValue('--cyan-500')
			},
			{
				label: '解析次数',
				data: data2,
				fill: false,
				tension: 0.4,
				borderColor: documentStyle.getPropertyValue('--orange-500')
			}
		]
	};
};

const setChartOptions = () => {
	// noinspection JSCheckFunctionSignatures
	const documentStyle = getComputedStyle(document.documentElement);
	const textColor = documentStyle.getPropertyValue('--text-color');
	const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
	const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

	return {
		maintainAspectRatio: false,
		aspectRatio: 0.6,
		plugins: {
			legend: {
				labels: {
					color: textColor
				}
			}
		},
		scales: {
			x: {
				ticks: {
					color: textColorSecondary
				},
				grid: {
					color: surfaceBorder
				}
			},
			y: {
				ticks: {
					color: textColorSecondary
				},
				grid: {
					color: surfaceBorder
				}
			}
		}
	};
};
</script>

<template>
	<div class="card flex justify-content-center" v-if="loading">
		<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)"
		                 animationDuration=".5s" aria-label="Custom ProgressSpinner" />
	</div>
	<Chart v-else type="line" :data="chartData" :options="chartOptions" class="h-20rem" />
</template>
