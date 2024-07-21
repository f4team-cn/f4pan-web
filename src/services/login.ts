import request from '@/utils/request';
import type {GetCookieResponse, GetQrCodeDataResponse, LoginResponse, UnicastQrCodeDataResponse} from '@/types';
import type {GenericAbortSignal} from 'axios';

/**
 * 后台登录
 * @param password
 */
export function login(password: string) {
	return request<LoginResponse>({
		method: 'POST',
		url: '/admin/auth/login',
		data: {
			pwd: password
		}
	});
}

/**
 * 获取二维码
 */
export function getQrCode() {
	return request<GetQrCodeDataResponse>({
		url: '/web_api/get_qrcode'
	});
}

/**
 * 获取登录状态
 * @param sign
 * @param signal
 */
export function unicastQrCode(sign: string, signal: GenericAbortSignal) {
	return request<UnicastQrCodeDataResponse>({
		url: '/web_api/unicast',
		params: { sign },
		ignore: true,
		signal
	});
}

/**
 * 获取 Cookie
 * @param bduss
 */
export function getCookieForBduss(bduss: string) {
	return request<GetCookieResponse>({
		url: '/web_api/qrcode_login',
		params: { bduss },
	});
}
