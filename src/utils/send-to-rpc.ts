import axios from 'axios';
import {useSystemConfigStore, useUserStore} from '@/store';
import {useMessage} from '@/hooks/useMessage';

export function sendToRPC(url: string, filename: string, dir?: string) {
	const user = useUserStore();
	const system = useSystemConfigStore();
	const message = useMessage();
	const basedir = user.rpc.basedir.replace(/\/$/, '');
	axios.post(`http://${user.rpc.host}:${user.rpc.port}/jsonrpc`, {
		jsonrpc: '2.0',
		id: 'F4Pan',
		method: 'aria2.addUri',
		params: [
			`token:${user.rpc.token}`,
			[url],
			{
				out: filename,
				header: [`User-Agent: ${system.parse_ua}`],
				dir: `${basedir}/${dir}`,
			}
		]
	}).then(() => {
		message.success(`成功推送 ${filename} 到 aria2 客户端！`);
	}).catch(e => {
		console.error(e);
		message.error('推送到远程 aria2 客户端出错！');
	});
}