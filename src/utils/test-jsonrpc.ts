import axios from 'axios';

export function testJsonrpc(host: string, port: number) {
	return new Promise<boolean>(resolve => {
		axios.post(`http://${host}:${port}/jsonrpc`)
			.then(() => resolve(true))
			.catch(e => {
				if (e.response !== undefined && e.response.status === 400) {
					resolve(true);
					return;
				}
				resolve(false);
			});
	});
}