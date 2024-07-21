import request from '@/utils/request';
import type {FileListResponse, UseApiKeyResponse} from '@/types';

/**
 * 获取文件列表
 * @param requestId
 * @param path
 */
export function getFileList(requestId: string, path?: string) {
	return request<FileListResponse>({
		method: 'GET',
		url: '/v1/parse/get_file_list',
		params: {
			req_id: requestId,
			isroot: path === undefined ? 1 : 0,
			dir: path
		}
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
			parse_key: key
		}
	});
}
