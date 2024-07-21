import {defineStore} from 'pinia';
import {watch} from 'vue';

export const useCacheStore = defineStore('cache-store', {
	state() {
		return {
			adminLogin: false,
			parseVerify: false,
			parseVerifyPassword: '',
			interceptUnload: false, // 禁止卸载,
			noticeDialog: false
		};
	},
	actions: {
		awaitForParseVerify(): Promise<string> {
			const _this = this;
			return new Promise(resolve => {
				const stopWatching = watch(() => _this.parseVerify,
					(newVal) => {
						if (!newVal) {
							resolve(_this.parseVerifyPassword ?? '');
							stopWatching();
						}
					}
				);
			});
		}
	}
});