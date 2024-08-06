import {createApp} from 'vue';
import App from './App.vue';
import '@/styles/main.scss';
import 'primevue/resources/themes/aura-light-indigo/theme.css';
import PrimeVue from 'primevue/config';
import {router} from '@/router';
import {store} from '@/store';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import {useMessage} from '@/hooks/useMessage';
import packages from '@/../package.json';
import 'driver.js/dist/driver.css';

console.log(`%c Github: https://github.com/f4team-cn/f4pan-web %c F4Pan %c 版本：${packages.version}`, 'color: #3eaf7c; font-size: 16px;line-height:30px;', 'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff', 'background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff');

(async () => {
	const app = createApp(App);
	app.use(PrimeVue, {ripple: false})
		.use(ToastService)
		.use(ConfirmationService)
		.use(router)
		.use(store);
	useMessage().init(app.config.globalProperties.$toast);
	await router.isReady();
	app.mount('#app');
})();
