import axios from 'axios';
import delay from '@/utils/delay';

type RPCProtocol = 'http' | 'ws';
type RPCConfig = {
	host: string,
	port: number,
	protocol: RPCProtocol,
	token?: string,
	ssl?: boolean
};
type Aria2Request = {
	jsonrpc: string,
	method: string,
	id: string,
	params: any[]
};

type Aria2Response<T = any, E = any> = {
	id: string;
	result: T;
	error?: E;
}

export default class Aria2RpcClient {
	static readonly VersionAction = 'aria2.getVersion';
	static readonly AddUriAction = 'aria2.addUri';

	private _config: RPCConfig;
	private _requestId: number;
	private socket?: WebSocket;
	private callbacks: Map<string, (value: any) => void> = new Map();
	public onOpen?: Function;
	public onClose?: Function;

	constructor(config: RPCConfig) {
		this._config = config;
		this._requestId = 0;
	}

	private get requestId() {
		return `F4Pan-${++this._requestId}`;
	}

	private get url() {
		return `${this._config.protocol}${this._config.ssl ? 's' : ''}://${this._config.host}:${this._config.port}/jsonrpc`;
	}

	isOpen() {
		if (this._config.protocol === 'ws') {
			return this.socket?.readyState === WebSocket.OPEN;
		}
		return true;
	}

	public async init() {
		if (this._config.protocol === 'http') {
			this._onOpen();
			return;
		}
		if (this.isOpen()) {
			return;
		}
		if (!this.socket) {
			this.socket = new WebSocket(this.url);
			this.socket.onopen = this._onOpen.bind(this);
			this.socket.onmessage = this.onMessage.bind(this);
			this.socket.onclose = this._onClose.bind(this);
		}
		for (let i = 0; i < 10; i++) {
			await delay(1000);
			if (this.isOpen()) {
				return
			}
		}
		throw new Error('连接 WebSocket 失败。');
	}

	private _onOpen() {
		this.onOpen?.();
	}

	private _onClose() {
		this.onClose?.();
	}

	private onMessage(event: MessageEvent) {
		const message = JSON.parse(event.data) as Aria2Response;
		if (message.id && this.callbacks.has(message.id)) {
			this.callbacks.get(message.id)?.(message);
			this.callbacks.delete(message.id);
		}
	}

	public close() {
		if (this.socket) {
			this.callbacks.forEach((value) => {
				value?.(null);
			});
			this.callbacks.clear();
			this.socket.close();
		}
	}

	public async call(method: string, params: any[]): Promise<Aria2Response | null> {
		const request: Aria2Request = {
			jsonrpc: '2.0',
			id: this.requestId,
			method,
			params: [`token:${this._config.token}`, ...params]
		};
		try {
			if (this._config.protocol === 'http') {
				const response = await axios.post(this.url, request);
				if (response.status === 200) {
					return response.data as Aria2Response;
				}
			} else {
				if (!this.isOpen) {
					return Promise.resolve(null);
				}
				return await (new Promise<Aria2Response>((resolve) => {
					this.callbacks.set(request.id, resolve);
					this.socket?.send(JSON.stringify(request));
				})) ?? null;
			}
		} catch {
			return null;
		}
		return null;
	}
}
