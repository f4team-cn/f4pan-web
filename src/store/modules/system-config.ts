import {defineStore} from 'pinia';
import {getSystemConfig} from '@/services/system';
import type {Notice, ParseKeyType} from '@/types';
import {getNotice} from '@/services/notice';

interface SystemConfig {
	requires_key: ParseKeyType;
	notice_id: number;
	parse_ua: string;
	notice: Notice;
	isInit: boolean;
}

export const useSystemConfigStore = defineStore('system-config-store', {
	state(): SystemConfig {
		return {
			isInit: false,
			requires_key: 'dynamic',
			notice_id: 0,
			parse_ua: '',
			notice: {
				id: 0,
				title: '',
				content: '',
				add_time: 0
			}
		};
	},
	actions: {
		async init() {
			const {data: res} = await getSystemConfig();
			const response = res.data;
			this.requires_key = response.requires_key;
			this.parse_ua = response.parse_ua;
			this.notice_id = Number(response.notice_id);
			// 公告
			if (this.notice_id > 0) {
				const {data} = await getNotice(this.notice_id);
				if (data.data) {
					this.notice = data.data;
				}
			}
			this.isInit = true;
		}
	}
});