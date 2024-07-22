import axios from 'axios';

export function testJsonrpc(host: string, port: number) {
	return new Promise<boolean>(resolve => {
		axios.post(`http://${host}:${port}/jsonrpc`, {}, {
			timeout: 1000 * 5
		})
			.then(() => resolve(true))
			.catch(e => {
				if (e.response !== undefined) {
					resolve(true);
					return;
				}
				resolve(false);
			});
	});
}