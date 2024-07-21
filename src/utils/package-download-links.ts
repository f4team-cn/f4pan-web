import JSZip from 'jszip';
import {useMessage} from '@/hooks/useMessage';
import FileSaver from 'file-saver';
import type {ParsedFile} from '@/types';

function getREADME() {
	return `免责声明
本网站提供的内容仅供参考。本站不在服务器上存储任何文件。所有链接均为外部下载链接，不由本站托管或控制。我们不保证通过这些链接下载的文件的准确性、可靠性或合法性。
使用本网站即表示您理解并同意以下条款：
1. 我们不对因使用下载的文件而造成的任何损害或损失负责。
2. 您有责任确保您下载文件的使用符合适用的版权法律。
3. 链接的包含不意味着我们认可这些网站的内容。我们不对链接网站的内容负责。
4. 下载的文件仅供学习参考。
`;
}

/**
 * 浏览器打包下载
 * @param results
 * @param format
 */
export async function packageDownloadLinks(results: ParsedFile[], format: string) {
	const zip = new JSZip();
	const message = useMessage();
	zip.file('说明.txt', getREADME());
	const content = results.map(v => format.replace(/{filename}/g, v.filename).replace(/{url}/g, v.link)).join('\n');
	zip.file('结果.txt', content);
	try {
		const blob = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			compressionOptions: {
				level: 9,
			}
		});
		FileSaver.saveAs(blob, 'F4Pan-' + Date.now() + '.zip');
		message.success('打包成功！正在下载……');
		return true;
	} catch (e) {
		console.error(e);
		message.error('打包失败，请重新尝试或使用 JSON RPC 下载。');
	}
	return false;
}