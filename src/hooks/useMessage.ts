import type {ToastServiceMethods} from 'primevue/toastservice';

let _APP : ToastServiceMethods | undefined;
const getToast = () => {
	return _APP;
};

export const useMessage = () => {
	const life = 5000;
	const toast = getToast();
	return {
		clear: () => toast?.removeAllGroups(),
		init: (app: ToastServiceMethods) => _APP = app,
		default: (detail: string) => toast?.add({severity: 'secondary', summary: '提示', detail, life, closable: true}),
		success: (detail: string) => toast?.add({severity: 'success', summary: '提示', detail, life, closable: true}),
		warn: (detail: string) => toast?.add({severity: 'warn', summary: '警告', detail, life, closable: true}),
		error: (detail: string) => toast?.add({severity: 'error', summary: '错误', detail, life, closable: true}),
		custom: toast
	};
};