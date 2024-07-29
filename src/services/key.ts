import request from '@/utils/request';
import type {ApiKeyListResponse, DeleteApiKeyResponse, GenerateApiKeyResponse} from '@/types';

/**
 * 生成 API KEY
 */
export function generateApiKey() {
	return request<GenerateApiKeyResponse>({
		url: '/admin/api_keys/generate',
		withLogin: true
	});
}

/**
 * 获取 API KEY 列表
 */
export function getApiKeyList() {
	return request<ApiKeyListResponse>({
		url: '/admin/api_keys',
		withLogin: true
	});
}

/**
 * 删除 API KEY
 * @param id
 */
export function deleteApiKey(id: number) {
	return request<DeleteApiKeyResponse>({
		url: '/admin/api_keys/delete',
		method: 'GET',
		params: {
			id
		},
		withLogin: true
	});
}