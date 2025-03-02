export const downloadTypes: { name: string, code: DownloadTypeCode, fmtName: string, page: string }[] = [
	{ name: 'Web', code: 'web', fmtName: 'Web', page: 'WebDownload' },
	{ name: 'Aria2 JSON RPC (推荐)', code: 'jsonrpc', fmtName: 'JSON RPC', page: 'JsonRPCDownload' },
	{ name: 'Motrix (推荐)', code: 'motrix', fmtName: 'Motrix', page: 'MotrixDownload' },
	{ name: 'IDM 下载', code: 'idm', fmtName: 'idm', page:'IDMDownload' },
	{ name: 'Aria2 Input', code: 'aria2input', fmtName: 'Aria2 Input', page: 'Aria2InputDownload' },
	{ name: 'JSON 文件', code: 'jsonfile', fmtName: 'JSON File', page: 'JsonFileDownload' }
];

export type DownloadTypeCode = 'web' | 'jsonrpc' | 'motrix' | 'idm' | 'aria2input' | 'jsonfile';
