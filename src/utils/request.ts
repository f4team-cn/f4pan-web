import axios, {type AxiosRequestConfig, type AxiosResponse, type CreateAxiosDefaults} from 'axios';
import {useMessage} from '@/hooks/useMessage';
import {useCacheStore, useUserStore} from '@/store';
import {useRouter} from 'vue-router';

interface CustomRequestOptions {
	withLogin?: boolean;
	ignore?: boolean;
}

const config: CreateAxiosDefaults = {
	timeout: 1000 * 20,
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
};

const instance = axios.create(config);

instance.interceptors.response.use(response => {
	const {ignore} = response.config as CustomRequestOptions;
	if (ignore) return response;
	const {data} = response;
	const message = useMessage();
	if (data.code !== 200 && data.code !== 1) {
		message.warn(data.message);
		return Promise.reject();
	} else if (data.code >= 400) {
		message.warn(data.message);
		useRouter().push('/').then(() => {
			const cacheStore = useCacheStore();
			cacheStore.adminLogin = true;
		});
		return Promise.reject();
	}
	return response;
}, error => {
	if (error?.config?.ignore) return Promise.reject(error);
	const v = error.toString();
	const message = useMessage();
	if (axios.isCancel(error)) {
		message.error('请求被取消！');
	} else if (v.includes('Network Error')) {
		message.error('网络错误，请检查您的网络情况！');
	} else if (v.includes('ECONNABORTED')) {
		message.error('请求超时，请刷新重试！');
	} else if (error.response) {
		message.error('服务器错误，联系管理员解决：' + error.message);
	} else if (error.request) {
		message.error('请求出错，联系管理员解决：' + error.message);
	} else if (error?.response?.status !== 200) {
		message.error('请求错误，请联系管理员解决：' + error.message);
	}
	return Promise.reject(error);
});

instance.interceptors.request.use(config => {
	const {withLogin} = config as CustomRequestOptions;
	if (withLogin) {
		const userStore = useUserStore();
		if (userStore.token) {
			// config.headers.Authorization = `Bearer ${userStore.token}`;
			config.headers.Authorization = `${userStore.token}`;
		}
	}
	return config;
});

export default <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D> & CustomRequestOptions): Promise<R> => {
	return instance(config);
};