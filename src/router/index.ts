import {createRouter, createWebHashHistory} from 'vue-router';
import routes from './routes';
import {useCacheStore, useSystemConfigStore, useUserStore} from '@/store';
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
		const systemStore = useSystemConfigStore();
		if (systemStore.isInit && (!stringIsEmpty(systemStore.notice.content) || !stringIsEmpty(systemStore.notice.title)))
			cacheStore.noticeDialog = true;
	}
	if (to.meta.title) {
		window.document.title = `F4Pan - ${to.meta.title}`;
	} else {
		window.document.title = `F4Pan`;
	}
});
