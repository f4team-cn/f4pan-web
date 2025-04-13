import { reactive } from 'vue';

export type LogType = 'info' | 'warning' | 'error' | 'success';
export type LogData = {
	type: LogType;
	data: string;
};

const logs = reactive<LogData[]>([]);

const clearLog = () => logs.length = 0;
const log = (data: string, type: LogType = 'info') => logs.unshift({
	type,
	data: `[${(new Date()).toLocaleTimeString()}] ${data}`
});

export const useLogger = () => {
	return {
		logs,
		clearLog,
		log
	};
};
