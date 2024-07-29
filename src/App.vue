<script lang="ts" setup>
import Toast from 'primevue/toast';
import {useCacheStore, useSystemConfigStore} from '@/store';
import {useMessage} from '@/hooks/useMessage';
import ConfirmPopup from 'primevue/confirmpopup';
import Dialog from 'primevue/dialog';
import AdminLoginDialog from '@/components/dialog/AdminLoginDialog.vue';
import ParseVerifyDialog from '@/components/dialog/ParseVerifyDialog.vue';
import {computed} from 'vue';
import {storeToRefs} from 'pinia';
import GithubCorners from '@/components/GithubCorners.vue';
import {router} from '@/router';
import {stringIsEmpty} from '@/utils/string-is-empty';
const message = useMessage(); // 挂载对象

const systemConfigStore = useSystemConfigStore();
const dialogStore = useCacheStore();
const systemConfigRef = storeToRefs(systemConfigStore);
const visible = computed({
	get: () => dialogStore.noticeDialog,
	set: v => dialogStore.noticeDialog = v
});

// 初始化系统配置
systemConfigStore.init().catch(() => {
	if (router.currentRoute.value.name !== 'Install') {
		message.error('系统错误！');
	}
}).then(() => {
	if (!stringIsEmpty(systemConfigStore.notice.content) || !stringIsEmpty(systemConfigStore.notice.title)) {
		visible.value = true;
	}
});

window.addEventListener('beforeunload', (e) => {
	if (!dialogStore.interceptUnload) {
		return;
	}
	e.preventDefault();
	e.returnValue = true;
});
</script>

<template>
	<div>
		<Toast />
		<ConfirmPopup></ConfirmPopup>
		<AdminLoginDialog />
		<ParseVerifyDialog />
		<Dialog v-model:visible="visible" modal maximizable :header="systemConfigRef.notice.value.title" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
			<p class="mb-5" v-html="systemConfigRef.notice.value.content"></p>
		</Dialog>
		<GithubCorners />
		<router-view/>
	</div>
</template>

