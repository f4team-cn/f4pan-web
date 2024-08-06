import {driver, type DriveStep, type Config} from 'driver.js';

type NextStep = (element: Element | undefined) => Promise<any>;

const baseAction = (step: DriveStep[], next: NextStep | undefined, cfg: Config | {}) => {
	const obj = driver({
		onNextClick: (element, step, opts) => {
			if (next) {
				next(element).then(() => obj.moveNext());
			} else {
				obj.moveNext();
			}
		},
		allowClose: true,
		showProgress: true,
		nextBtnText: '下一步',
		prevBtnText: '上一步',
		doneBtnText: '结束',
		steps: step,
		...cfg
	});
	return obj;
};

export const actionOne = () => {
	const obj = baseAction([
		{
			element: '#driver-step-pan-url-input',
			popover: {
				title: '第一步',
				description: '在这里输入网盘链接。'
			}
		},
		{
			element: '#driver-step-pan-pwd-input',
			popover: {
				title: '第二步',
				description: '在这里输入网盘密码，一般不需要手动输入。'
			}
		},
		{
			element: '#driver-step-action-parse',
			popover: {
				title: '第三步',
				description: '记得点击开始！'
			}
		},
		{
			element: '#driver-step-menu',
			popover: {
				title: '更多功能',
				description: '这里可以再次查看公告呢！'
			}
		}
	], undefined, {});
	obj.drive();
};

export const actionTwo = (next: NextStep) => {
	const obj = baseAction([
		{
			element: '#driver-step-file-list',
			popover: {
				title: '接下来，你需要选择需要的文件',
				description: '在这里选择文件。'
			}
		},
		{
			element: '#driver-step-file-count',
			popover: {
				title: '查看文件信息',
				description: '在这里查看你选择的文件数量及大小。'
			}
		},
		{
			element: '#driver-step-select-download-type',
			popover: {
				title: '非常好，接下来你需要选择适合你的下载方式',
				description: 'Web 下载方式为获取下载链接，JSON RPC 为推送下载任务到你的 Aria2 客户端。'
			}
		},
		{
			element: '#driver-step-test-json-rpc',
			popover: {
				title: '检查连通性',
				description: '如果你选择了 JSON RPC 的方式，你可以在这里检查连通性！'
			}
		},
		{
			element: '#driver-step-done',
			popover: {
				title: '最后',
				description: '最后记得点击开始下载！恭喜你，你已经学会了如何使用本平台，如果需要再次查看，请在 首页 的 设置 按钮中查看。'
			}
		}
	], next, {
		onDestroyed: () => {
			window.localStorage.setItem('driver-step-done', 'true');
		}
	});
	obj.drive();
};