import {createRouter, createWebHashHistory} from 'vue-router';
import routes from './routes';
import {useCacheStore, useUserStore} from '@/store';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {useMessage} from '@/hooks/useMessage';

export const router = createRouter({
	history: createWebHashHistory(),
	routes
});

router.beforeEach((to, from, next) => {
	if (to.meta.login) {
		const userStore = useUserStore();
		const message = useMessage();
		console.log(userStore.token);
		if (!stringIsEmpty(userStore.token)) {
			next();
			return;
		}
		const cacheStore = useCacheStore();
		message.warn('请先登录！');
		cacheStore.adminLogin = true;
		next('/');
		return;
	}
	next();
});

router.afterEach((to, from, next) => {
	if (to.meta.notice) {
		const cacheStore = useCacheStore();
		cacheStore.noticeDialog = true;
	}
});
