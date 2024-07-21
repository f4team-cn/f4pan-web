import request from '@/utils/request';
import type {GenerateApiKeyResponse} from '@/types';

/**
 * 生成 API KEY
 */
export function generateApiKey() {
	return request<GenerateApiKeyResponse>({
		url: '/admin/api_keys/generate',
		withLogin: true
	});
}
