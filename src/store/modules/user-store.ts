import {defineStore} from 'pinia';
import {login} from '@/services/login';
import type {RPCConfig} from '@/types';

interface UserStore {
	token: string;
	req_id: string;
	exportFormat: string;
	rpc: RPCConfig;
}

export const useUserStore = defineStore('user-store', {
	state(): UserStore {
		return {
			token: '',
			req_id: '',
			exportFormat: '{filename}-{url}',
			rpc: {
				host: 'localhost',
				port: '6800',
				token: ''
			}
		};
	},
	persist: true,
	actions: {
		saveToken(token: string) {
			this.token = token;
		},
		async login(password: string) {
			try {
				const response = await login(password);
				const result = response.data;
				const token = result.data.token;
				if (token) {
					this.saveToken(token);
					return true;
				}
			} catch {
				return false;
			}
			return false;
		}
	}
});