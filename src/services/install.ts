import request from '@/utils/request';
import type {CheckEnvironmentResponse, MySQLConfig, RedisConfig, TestConnectionResponse} from '@/types';

/**
 * 检查系统环境
 */
export function checkEnvironment() {
	return request<CheckEnvironmentResponse>({
		url: '/install/check_env'
	});
}

/**
 * 测试 MySQL
 * @param config
 */
export function testMySqlConnection(config: MySQLConfig) {
	return request<TestConnectionResponse>({
		url: '/install/test_db',
		method: 'POST',
		data: config
	});
}

/**
 * 测试 Redis
 * @param config
 */
export function testRedisConnection(config: RedisConfig) {
	return request<TestConnectionResponse>({
		url: '/install/test_redis',
		method: 'POST',
		data: config
	});
}

/**
 * 开始安装
 * @param config
 */
export function install(config: Record<any, any>) {
	return request<TestConnectionResponse>({
		url: '/install/install',
		method: 'POST',
		data: config
	});
}