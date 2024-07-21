import type {WorkerRequest, WorkerRequestBody} from '@/types';

type CALLBACK = Function | undefined;

const worker = new Worker(new URL('../worker/parse.ts', import.meta.url), {
	type: 'module',
});

let callback: CALLBACK;
worker.onmessage = event => {
	callback?.(event.data);
}

const addTask = (files: WorkerRequestBody[]) => {
	worker.postMessage({
		type: 'add',
		body: files
	} as WorkerRequest);
};

export const useWorker = () => {
	return {
		addTask,
		setCallback: (cb: CALLBACK) => callback = cb,
	}
};
