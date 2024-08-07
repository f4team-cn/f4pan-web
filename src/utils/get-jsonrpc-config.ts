import axios from 'axios';
import {useUserStore} from '@/store';

export async function getJsonRpcConfig(): Promise<Record<string, string>> {
	const user = useUserStore();
	try {
		const {data} = await axios.post(`http://${user.rpc.host}:${user.rpc.port}/jsonrpc`, {
			jsonrpc: '2.0',
			id: 'F4Pan',
			method: 'aria2.getGlobalOption',
			params: []
		}, {
			timeout: 1000 * 5
		});
		return data.result;
	} catch {
		return {};
	}
}