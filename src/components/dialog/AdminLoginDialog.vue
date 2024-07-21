<script setup lang="ts">
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import {useCacheStore, useUserStore} from '@/store';
import {computed, ref} from 'vue';
import {useMessage} from '@/hooks/useMessage';
import {useRouter} from 'vue-router';

const cacheStore = useCacheStore();
const userStore = useUserStore();
const message = useMessage();
const router = useRouter();
const password = ref('');
const loading = ref(false);
const show = computed<boolean>({
	get: () => cacheStore.adminLogin,
	set: v => cacheStore.adminLogin = v
});

const doLogin = async () => {
	if (password.value.length === 0) {
		message.warn('请输入密码!');
		return;
	}
	loading.value = true;
	const result = await userStore.login(password.value);
	loading.value = false;
	if (result) {
		message.success('登录成功！');
		setTimeout(() => {
			show.value = false;
			router.push({name: 'Dashboard'});
		}, 1200);
	}
}
</script>

<template>
	<Dialog v-model:visible="show" modal header="后台登录" :style="{ width: '25rem' }">
		<div class="flex align-items-center gap-3 mb-5">
			<label for="email" class="font-semibold w-6rem">密码</label>
			<InputText class="flex-auto" autocomplete="off" type="password" v-model="password" />
		</div>
		<div class="flex justify-content-end gap-2">
			<Button type="button" label="取消" severity="secondary" @click="show = false"></Button>
			<Button type="button" label="登录" @click="doLogin" :loading="loading"></Button>
		</div>
	</Dialog>
</template>

<style scoped>

</style>