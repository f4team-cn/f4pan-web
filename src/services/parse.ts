import request from '@/utils/request';
import type { FileListResponse, ShareInfo, UseApiKeyResponse } from '@/types';

/**
 * 获取文件列表
 * @param requestId
 * @param path
 * @param shareInfo
 */
export function getFileList(requestId: string, path?: string, shareInfo?: ShareInfo) {
	return request<FileListResponse>({
		method: 'POST',
		url: '/v1/parse/get_file_list',
		params: {
			req_id: requestId,
			isroot: path === undefined ? 1 : 0,
			dir: path,
		},
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
		},
		data: {
			shareinfo: shareInfo || {},
		},
	});
}

/**
 * 获取请求ID
 * @param surl
 * @param pwd
 * @param key
 */
export function getRequestId(surl: string, pwd: string, key: string | undefined) {
	return request<UseApiKeyResponse>({
		method: 'GET',
		url: '/public/use_parse_key',
		params: {
			surl,
			pwd,
			parse_key: key,
		},
	});
}
