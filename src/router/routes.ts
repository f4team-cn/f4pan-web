import type {RouteRecordRaw} from 'vue-router';

export default [{
	path: '/',
	component: () => import('@/pages/IndexPage.vue'),
	name: 'Home',
	meta: {
		notice: true
	}
}, {
	path: '/parsed/:reqId/:surl/:pwd',
	component: () => import('@/pages/Parsed.vue'),
	name: 'Parsed'
}, {
	path: '/dashboard',
	component: () => import('@/layouts/AdminLayout.vue'),
	meta: {
		login: true
	},
	name: 'Admin',
	children: [
		{
			path: '',
			component: () => import('@/pages/admin/Dashboard.vue'),
			name: 'Dashboard',
			meta: {
				title: '首页',
				icon: 'pi pi-home'
			}
		},
		{
			path: 'disk-account',
			component: () => import('@/pages/admin/DiskAccount.vue'),
			name: 'DiskAccount',
			meta: {
				title: '账号管理',
				icon: 'pi pi-user'
			}
		},
		{
			path: 'notice',
			component: () => import('@/pages/admin/NoticeManager.vue'),
			name: 'NoticeManager',
			meta: {
				title: '公告管理',
				icon: 'pi pi-bell'
			}
		},
		{
			path: 'system',
			component: () => import('@/pages/admin/SystemManager.vue'),
			name: 'SystemManager',
			meta: {
				title: '系统管理',
				icon: 'pi pi-cog'
			}
		},
		{
			path: 'api-key',
			component: () => import('@/pages/admin/ApiKey.vue'),
			name: 'ApiKey',
			meta: {
				title: '密钥管理',
				icon: 'pi pi-key'
			}
		}
	]
}, {
	path: '/install',
	component: () => import('@/pages/Install.vue'),
	name: 'Install'
}] as RouteRecordRaw[];