<script setup lang="ts">
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';
import {storeToRefs} from 'pinia';
import {useCacheStore, useSystemConfigStore} from '@/store';
import {computed} from 'vue';
import {useMessage} from '@/hooks/useMessage';

const message = useMessage();
const dialogStore = useCacheStore();
const show = computed({
	get: () => dialogStore.parseVerify,
	set: v => dialogStore.parseVerify = v
});
const password = computed({
	get: () => dialogStore.parseVerifyPassword,
	set: v => dialogStore.parseVerifyPassword = v
});

const systemStore = useSystemConfigStore();
const refs = storeToRefs(systemStore);

const cancel = () => {
	password.value = '';
	show.value = false;
};

const next = () => {
	if (refs.requires_key.value === 'dynamic' && password.value.length < 6) {
		message.warn('请输入 6 位动态密码！');
		return;
	}
	if (refs.requires_key.value === 'fixed' && password.value.length === 0) {
		message.warn('请输入正确的解析密码！');
		return;
	}
	show.value = false;
};

const onKeyDown = (e: KeyboardEvent) => {
	if (e.key === 'Enter' || e.keyCode === 13) {
		next();
	}
};
</script>

<template>
	<Dialog v-model:visible="show" modal header="解析密码" :style="{ width: '25rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
		<div class="flex align-items-center gap-3 mb-5" v-if="refs.requires_key.value === 'fixed'">
			<label for="email" class="font-semibold w-6rem">密码</label>
			<InputText class="flex-auto" autocomplete="off" type="password" v-model="password" />
		</div>
		<div class="flex align-items-center gap-3 mb-5" v-if="refs.requires_key.value === 'dynamic'">
			<label for="email" class="font-semibold w-6rem">密码</label>
			<InputOtp class="flex-auto" :length="6" v-model="password" @keydown="onKeyDown"></InputOtp>
		</div>
		<div class="flex justify-content-end gap-2">
			<Button type="button" label="取消" severity="secondary" @click="cancel"></Button>
			<Button type="button" label="继续" @click="next"></Button>
		</div>
	</Dialog>
</template>

<style scoped>

</style>
