import request from '@/utils/request';
import type {
	AddNoticeResponse,
	DeleteNoticeResponse,
	NoticeListResponse, NoticeResponse,
	UpdateNoticeResponse,
	UseNoticeResponse
} from '@/types';

/**
 * 获取激活的公告
 * @param id 公告ID
 */
export function getNotice(id: number) {
	return request<NoticeResponse>({
		url: '/public/get_notice',
		params: {
			id
		}
	});
}

/**
 * 获取所有公告
 */
export function getAllNotice() {
	return request<NoticeListResponse>({
		url: '/admin/notices/all',
		withLogin: true
	});
}

/**
 * 添加公告
 * @param title
 * @param content
 */
export function addNotice(title: string, content: string) {
	return request<AddNoticeResponse>({
		method: 'POST',
		url: '/admin/notices/add',
		data: {
			title,
			content
		},
		withLogin: true
	});
}

/**
 * 更新公告
 * @param title
 * @param content
 * @param id
 */
export function updateNotice(title: string, content: string, id: number) {
	return request<UpdateNoticeResponse>({
		method: 'POST',
		url: '/admin/notices/update',
		data: {
			id,
			title,
			content
		},
		withLogin: true
	});
}

/**
 * 删除公告
 * @param id
 */
export function deleteNotice(id: number) {
	return request<DeleteNoticeResponse>({
		method: 'POST',
		url: '/admin/notices/delete',
		data: { id },
		withLogin: true
	});
}

/**
 * 设置公告
 * @param id
 * @constructor
 */
export function useNotice(id: number) {
	return request<UseNoticeResponse>({
		method: 'POST',
		url: '/admin/notices/use',
		data: { id },
		withLogin: true
	});
}