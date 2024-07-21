export function renderSize(value: number) {
	if (value === 0) {
		return '0 Bytes';
	}
	const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let index = 0;
	index = Math.floor(Math.log(value) / Math.log(1024));
	let size: string | number = value / Math.pow(1024, index);
	size = size.toFixed(2);
	return size + unitArr[index];
}
