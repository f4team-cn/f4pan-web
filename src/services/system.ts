import request from '@/utils/request';
import type {
	AddSystemSettingResponse,
	DeleteSystemSettingResponse,
	SystemConfigResponse,
	SystemSetting, SystemSettingListResponse, SystemStatusResponse,
	UpdateSystemSettingResponse, UseSystemSettingResponse
} from '@/types';

/**
 * 获取系统信息
 */
export function getSystemConfig() {
	return request<SystemConfigResponse>({
		url: '/public/get_system',
	});
}

/**
 * 获取统计信息
 */
export function getSystemStatus() {
	return request<SystemStatusResponse>({
		url: '/public/get_status',
	});
}

/**
 * 获取所有配置组
 */
export function getSystemConfigList() {
	return request<SystemSettingListResponse>({
		url: '/admin/systems/all',
		withLogin: true
	});
}

/**
 * 添加系统配置组
 * @param configs
 * @constructor
 */
export function addSystemConfig(configs: Omit<SystemSetting, 'is_active'>) {
	return request<AddSystemSettingResponse>({
		method: 'POST',
		url: '/admin/systems/add',
		data: configs,
		withLogin: true
	});
}

/**
 * 更新系统配置组
 * @param configs
 * @param id
 * @constructor
 */
export function updateSystemConfig(configs: Omit<SystemSetting, 'is_active'>, id: number) {
	return request<UpdateSystemSettingResponse>({
		method: 'POST',
		url: '/admin/systems/update',
		data: {
			id, ...configs
		},
		withLogin: true
	});
}

/**
 * 删除系统配置组
 * @param id
 * @constructor
 */
export function deleteSystemConfig(id: number) {
	return request<DeleteSystemSettingResponse>({
		method: 'POST',
		url: '/admin/systems/delete',
		data: { id },
		withLogin: true
	});
}

/**
 * 设置系统配置组
 * @param id
 * @constructor
 */
export function UseSystemConfig(id: number) {
	return request<UseSystemSettingResponse>({
		method: 'POST',
		url: '/admin/systems/use',
		data: { id },
		withLogin: true
	});
}
