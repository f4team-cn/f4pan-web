export function openUri(uri: string): Promise<boolean> {
	return new Promise(resolve => {
		const iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		iframe.src = uri;
		document.body.appendChild(iframe);
		const startTime = Date.now();
		const task = setInterval(() => {
			const endTime = Date.now();
			if (endTime - startTime > 30) {
				document.body.removeChild(iframe)
				iframe.remove();
				clearInterval(task);
				resolve(false);
				window.removeEventListener('blur', onBlur);
			}
		}, 50);
		const onBlur = () => {
			iframe.remove();
			clearInterval(task);
			resolve(true);
		};
		window.addEventListener('blur', onBlur, {
			once: true
		});
	});
}
