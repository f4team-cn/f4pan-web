import {useSystemConfigStore, useUserStore} from '@/store';
import QueryString from 'qs';
import {openUri} from '@/utils/open-uri';

export async function addUri(url: string, filename: string, dir?: string) {
	const user = useUserStore();
	const system = useSystemConfigStore();
	const basedir = user.rpc.basedir.replace(/\/$/, '');
	const query = QueryString.stringify({
		uri: url,
		out: filename,
		dir: `${basedir}/${dir}`,
		userAgent: system.parse_ua,
		silent: true,
		'max-connection-per-server': 6 // 防止下载时批量请求重定向接口
	});
	await openUri(`motrix://command/application:new-task?${query}`);
}

export function waken() {
	return openUri('motrix://');
}
