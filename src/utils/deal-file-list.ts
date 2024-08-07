import type {File, TreeFileInfo} from '@/types';

export function dealFileList(files: File[]) {
	// 获取网盘中的根目录
	const _filename = files[0].filename;
	const _path = files[0].path;
	const root = _path.replace(_filename, '')

	// 树状结构
	const tree: TreeFileInfo[] = files.map(file => {
		const dir = Number(file.isdir);
		return {
			key: file.fs_id,
			label: file.filename,
			leaf: !dir,
			path: file.path,
			size: file.size,
			icon: `pi ${dir ? 'pi-folder' : 'pi-file'}`,
			fs_id: file.fs_id,
		};
	});
	return {
		tree,
		root
	};
}