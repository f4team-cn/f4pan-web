import type {
	AddVipAccountResponse,
	DeleteVipAccountResponse,
	UpdateVipAccountResponse,
	VipAccountListResponse
} from "@/types";
import request from '@/utils/request';

/**
 * 获取账号列表
 */
export function getVipAccountList() {
	return request<VipAccountListResponse>({
		url: '/admin/svips/all',
		withLogin: true
	});
}

/**
 * 添加账号
 * @param cookie 账号信息
 */
export function addVipAccount(cookie: string) {
	return request<AddVipAccountResponse>({
		method: 'POST',
		url: '/admin/svips/add',
		params: { cookie },
		withLogin: true
	});
}

/**
 * 删除账号
 * @param id 账号ID
 */
export function deleteVipAccount(id: number) {
	return request<DeleteVipAccountResponse>({
		method: 'POST',
		url: '/admin/svips/delete',
		params: {
			id
		},
		withLogin: true
	});
}

/**
 * 更新账号
 * @param id 账号ID
 */
export function updateVipAccount(id: number) {
	return request<UpdateVipAccountResponse>({
		method: 'POST',
		url: '/admin/svips/update',
		params: {
			id
		},
		withLogin: true
	});
}

