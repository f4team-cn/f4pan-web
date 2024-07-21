import type {ParseFileResponse, WorkerRequestBody, WorkerResponse} from '@/types';
import request from '@/utils/request';

const Main = self;

Main.onmessage = function (e) {
	const data = e.data || {};
	if (data.type === 'add') {
		const files = data.body || [];
		const max = files.length || 0;
		if (max === 0) return;
		for (let i = 0; i < files.length; i++) {
			doParse(files[i], i + 1, max);
		}
	}
};

function doParse(data: WorkerRequestBody, n: number, max: number) {
	const {reqId, surl, pwd, fs_id, seckey, share_id, uk} = data;
	const query = {
		req_id: reqId,
		surl,
		pwd,
		fs_id,
		randsk: seckey,
		share_id,
		uk
	};
	request<ParseFileResponse>({
		url: '/v1/parse/parse_file',
		params: query,
		ignore: true
	}).then(res => {
		if (res.data.code === 200) {
			Main.postMessage({
				type: 'success',
				body: res.data.data
			} as WorkerResponse);
		} else {
			Main.postMessage({
				type: 'error',
				message: res.data.message
			} as WorkerResponse);
		}
	}).finally(() => {
		if (n >= max) {
			Main.postMessage({
				type: 'done',
				n, max
			} as WorkerResponse);
		} else {
			Main.postMessage({
				type: 'progress',
				n, max
			} as WorkerResponse);
		}
	}).catch(console.error);
}