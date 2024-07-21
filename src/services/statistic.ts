import request from '@/utils/request';

export function getStatisticIP() {
	return request({
		url: '/admin/statistics/get_ip',
	});
}

export function getStatisticIPCount() {
	return request({
		url: '/admin/statistics/get_ip_count',
	});
}