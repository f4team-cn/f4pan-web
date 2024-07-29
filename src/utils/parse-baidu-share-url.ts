interface Result {
	pwd?: string;
	surl?: string;
}

export function parseBaiduShareUrl(value: string): Result {
	const result: Result = {};
	const regex = /https?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(),]|%[0-9a-fA-F][0-9a-fA-F])+/;
	const codeRegex = /提取码([:：])\s*(([a-zA-Z]|[0-9]){4})/;
	// 数据验证
	if (!regex.test(value)) return result;
	let baiduUrl = regex.exec(value)?.[0];
	if (baiduUrl === undefined) return result;
	let uri = new URL(baiduUrl);
	// 来源验证
	if (uri.host !== 'pan.baidu.com') return result;
	// 提取码
	result.pwd = uri.searchParams.get('pwd') || codeRegex.exec(value)?.[2] || '';
	// 短链接
	result.surl = uri.searchParams.has('surl') ? `1${uri.searchParams.get('surl')!!}` : uri.pathname.substring(3);
	return result;
}
