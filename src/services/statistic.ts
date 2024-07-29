import request from '@/utils/request';
import type {IPCountResponse} from '@/types';

export function getStatisticIP() {
	return request({
		url: '/admin/statistics/get_ip',
		withLogin: true
	});
}

export function getStatisticIPCount() {
	return request<IPCountResponse>({
		url: '/admin/statistics/get_ip_count',
		withLogin: true
	});
}